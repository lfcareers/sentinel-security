mod detection;
mod kafka;
use kafka::producer::AlertProducer;

use anyhow::Result;

use rdkafka::{
    config::ClientConfig,
    consumer::{Consumer, StreamConsumer},
    message::Message,
};

use security_events::{EventEnvelope, ProcessEvent};

use detection::process_rules::evaluate_process;

#[tokio::main]
async fn main() -> Result<()> {
    tracing_subscriber::fmt()
        .with_target(false)
        .compact()
        .init();

    tracing::info!("Sentinel Alert Engine starting");
    let kafka_brokers = std::env::var("KAFKA_BOOTSTRAP_SERVERS")
        .unwrap_or_else(|_| "localhost:9092".to_string());

    tracing::info!(
    brokers = %kafka_brokers,
    "Configuring Kafka transport"
    );

    let consumer: StreamConsumer = ClientConfig::new()
        .set("group.id", "sentinel-alert-engine")
        .set("bootstrap.servers", &kafka_brokers)
        .set("enable.partition.eof", "false")
        .set("session.timeout.ms", "6000")
        .set("enable.auto.commit", "true")
        .create()?;

    consumer.subscribe(&["security.endpoint.process"])?;

    let producer = AlertProducer::new(&kafka_brokers)?;

    tracing::info!("Alert Kafka producer initialized");

    tracing::info!("Listening for endpoint process events");

    loop {
        let message = consumer.recv().await?;

        let Some(payload) = message.payload_view::<str>() else {
            continue;
        };

        let payload = match payload {
            Ok(value) => value,
            Err(error) => {
                tracing::warn!(
                    error = %error,
                    "Invalid Kafka payload"
                );

                continue;
            }
        };

        let event: EventEnvelope<ProcessEvent> = match serde_json::from_str(payload) {
            Ok(event) => event,

            Err(error) => {
                tracing::warn!(
                    error = %error,
                    "Failed to deserialize process event"
                );

                continue;
            }
        };

        let alerts = evaluate_process(event.event_id, &event.host_id, &event.payload);

        for alert in alerts {
            tracing::warn!(
                rule = %alert.rule_id,
                risk_score = alert.risk_score,
                process_id = ?alert.process_id,
                title = %alert.title,
                "Sentinel detection generated"
            );

            let json = serde_json::to_string(&alert)?;

            producer.publish(
                "security.alert.generated",
                &alert.alert_id.to_string(),
                &json,
            )?;

            println!("{}", serde_json::to_string_pretty(&alert)?);
        }
    }
}
