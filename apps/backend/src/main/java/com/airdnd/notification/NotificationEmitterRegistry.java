package com.airdnd.notification;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;

@Component
public class NotificationEmitterRegistry {
    private static final long TIMEOUT = 60 * 60 * 1000;

    private final Map<Long, List<SseEmitter>> emitters = new ConcurrentHashMap<>();

    public SseEmitter subscribe(Long memberId) {
        SseEmitter emitter = new SseEmitter(TIMEOUT);
        emitters.computeIfAbsent(memberId,k -> new CopyOnWriteArrayList<>()).add(emitter);

        emitter.onCompletion(() -> remove(memberId, emitter));
        emitter.onTimeout(() -> remove(memberId, emitter));
        emitter.onError((e) -> remove(memberId, emitter));

        try {
            emitter.send(SseEmitter.event().name("connect").data("connected"));
        } catch (Exception e) {
            remove(memberId, emitter);
        }
        return emitter;
    }

    public void send(Long memberId, Object data) {
        List<SseEmitter> targets = emitters.get(memberId);
        if (targets == null) return;
        for (SseEmitter emitter : targets) {
            try {
                emitter.send(SseEmitter.event().name("notification").data(data));
            }
            catch (Exception e) {
                remove(memberId, emitter);
            }
        }
    }

    private void remove(Long memberId, SseEmitter emitter) {
        List<SseEmitter> targets = emitters.get(memberId);
        if (targets == null) return;
        targets.remove(emitter);
        if (targets.isEmpty()) emitters.remove(memberId);
    }

}
