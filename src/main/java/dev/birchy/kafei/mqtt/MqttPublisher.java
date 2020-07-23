package dev.birchy.kafei.mqtt;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;

import org.eclipse.paho.client.mqttv3.MqttClient;
import org.eclipse.paho.client.mqttv3.MqttException;

import javax.inject.Inject;
import javax.inject.Singleton;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@Singleton
public final class MqttPublisher {
    @Inject
    private ObjectMapper mapper;
    @Inject
    private MqttClient client;

    public synchronized void publish(
            String topic,
            Object message)
            throws MqttException, JsonProcessingException {

        if(!client.isConnected()) {
            log.warn("MQTT not connected");
            return;
        }

        byte[] messageBytes = mapper.writeValueAsBytes(message);
        log.debug("Notifying topic={}, message={}",
                topic,
                message);

        client.publish(topic, messageBytes, 2, false);
    }
}
