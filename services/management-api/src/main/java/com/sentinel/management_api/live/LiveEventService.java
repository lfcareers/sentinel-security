package com.sentinel.management_api.live;

import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.List;
import java.util.concurrent.CopyOnWriteArrayList;

@Service
public class LiveEventService {

    private final List<SseEmitter> emitters =
            new CopyOnWriteArrayList<>();

    public SseEmitter subscribe() {

        SseEmitter emitter = new SseEmitter(0L);

        emitters.add(emitter);

        emitter.onCompletion(() ->
                emitters.remove(emitter));

        emitter.onTimeout(() ->
                emitters.remove(emitter));

        emitter.onError(error ->
                emitters.remove(emitter));

        try {
            emitter.send(
                    SseEmitter.event()
                            .name("connected")
                            .data("sentinel-stream-ready")
                            .reconnectTime(3000)
            );
        } catch (IOException exception) {
            emitters.remove(emitter);
            emitter.completeWithError(exception);
        }

        return emitter;
    }

    public void publish(LiveSecurityEvent event) {

        for (SseEmitter emitter : emitters) {

            try {

                emitter.send(
                        SseEmitter.event()
                                .name("security-alert")
                                .data(event)
                );

            } catch (IOException exception) {

                emitter.complete();
                emitters.remove(emitter);
            }
        }
    }
    public void publishRawTelemetry(String payload) {

        for (SseEmitter emitter : emitters) {

            try {

                emitter.send(
                        SseEmitter.event()
                                .name("raw-telemetry")
                                .data(payload)
                );

            } catch (IOException exception) {

                emitter.complete();
                emitters.remove(emitter);
            }
        }
    }
}