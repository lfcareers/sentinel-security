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
        let producer: BaseProducer = ClientConfig::new()
            .set("bootstrap.servers", brokers)
            .set("message.timeout.ms", "5000")
            .create()?;

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