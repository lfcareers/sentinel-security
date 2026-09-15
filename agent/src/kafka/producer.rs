use std::time::Duration;

use rdkafka::{
    config::ClientConfig,
    producer::{BaseProducer, BaseRecord, Producer},
};

pub struct KafkaProducer {
    producer: BaseProducer,
}

impl KafkaProducer {
    pub fn new(brokers: &str) -> Result<Self, rdkafka::error::KafkaError> {
        let security_protocol = std::env::var("KAFKA_SECURITY_PROTOCOL")
            .unwrap_or_else(|_| "PLAINTEXT".to_string());

        let sasl_mechanism = std::env::var("KAFKA_SASL_MECHANISM")
            .unwrap_or_else(|_| "PLAIN".to_string());

        let sasl_username =
            std::env::var("KAFKA_SASL_USERNAME").unwrap_or_default();

        let sasl_password =
            std::env::var("KAFKA_SASL_PASSWORD").unwrap_or_default();

        let mut config = ClientConfig::new();

        config
            .set("bootstrap.servers", brokers)
            .set("security.protocol", &security_protocol)
            .set("message.timeout.ms", "5000")
            .set("session.timeout.ms", "45000");

        if security_protocol != "PLAINTEXT" {
            config
                .set("sasl.mechanisms", &sasl_mechanism)
                .set("sasl.username", &sasl_username)
                .set("sasl.password", &sasl_password);
        }

        let producer: BaseProducer = config.create()?;

        Ok(Self { producer })
    }

    pub fn publish(
        &self,
        topic: &str,
        key: &str,
        payload: &str,
    ) -> anyhow::Result<()> {
        self.producer
            .send(
                BaseRecord::to(topic)
                    .key(key)
                    .payload(payload),
            )
            .map_err(|(error, _)| anyhow::anyhow!(error))?;

        self.producer
            .flush(Duration::from_secs(5))
            .map_err(|error| anyhow::anyhow!(error))?;

        Ok(())
    }
}