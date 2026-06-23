package com.airdnd.notification;


import com.airdnd.common.error.ErrorCode;
import com.airdnd.common.exception.BusinessException;
import com.airdnd.notification.dto.NotificationResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final NotificationEmitterRegistry emitterRegistry;

    @Transactional(readOnly = true)
    public List<NotificationResponse> getNotifications(Long memberId) {
        return notificationRepository.findByMemberIdOrderByCreatedAtDesc(memberId).stream()
                .map(n -> new NotificationResponse(
                        n.getId(),n.getType(),n.getContent(),n.getRedirectUrl(),
                        n.isRead(),n.getCreatedAt())).toList();
    }

    @Transactional
    public void markRead(Long memberId, Long id) {
        Notification notification = notificationRepository.findByIdAndMemberId(id, memberId)
                .orElseThrow(() -> new BusinessException(ErrorCode.NOTIFICATION_NOT_FOUND));
        notification.markAsRead();
    }

    @Transactional
    public void markAllRead(Long memberId) {
        notificationRepository.markAllAsReadByMemberId(memberId);
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void notify(Long memberId, NotificationType type, String content, String redirectUrl) {
        notificationRepository.save(Notification.create(memberId, type, content, redirectUrl));
        emitterRegistry.send(memberId, "new");
    }

    @Transactional(readOnly = true)
    public long getUnreadCount(Long memberId) {
        return notificationRepository.countByMemberIdAndIsReadFalse(memberId);
    }
}
