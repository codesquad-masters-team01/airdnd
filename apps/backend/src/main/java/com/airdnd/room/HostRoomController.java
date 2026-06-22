package com.airdnd.room;


import com.airdnd.auth.AuthMemberPrincipal;
import com.airdnd.room.dto.*;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/host/rooms")
public class HostRoomController {

    private final RoomService roomService;
    private final S3PresignService s3PresignService;


    @PostMapping
    public ResponseEntity<Long> registerRoom(@AuthenticationPrincipal AuthMemberPrincipal principal, @RequestBody @Valid HostRoomRequest request) {

        Long roomId = roomService.registerRoom(principal.getMemberId() , principal.getNickname(), request);

        return ResponseEntity.status(HttpStatus.CREATED).body(roomId);
    }


    @GetMapping
    public ResponseEntity<List<HostRoomResponse>> getAllRooms(@AuthenticationPrincipal AuthMemberPrincipal principal) {
        return ResponseEntity.status(HttpStatus.OK).body(roomService.getRoomsByHostId(principal.getMemberId()));
    }

    @PatchMapping("/{roomId}")
    public ResponseEntity<RoomDetailResponse> updateRoom(@PathVariable Long roomId,
                                                         @AuthenticationPrincipal AuthMemberPrincipal principal,
                                                         @RequestBody RoomUpdateRequest request) {
        RoomDetailResponse updatedRoom = roomService.updateRoomDetails(principal.getMemberId(),roomId,request);
        return ResponseEntity.status(HttpStatus.OK).body(updatedRoom);
    }

    @GetMapping("/{roomId}")
    public ResponseEntity<HostRoomResponse> getRoom(@AuthenticationPrincipal AuthMemberPrincipal principal,@PathVariable Long roomId) {

        HostRoomResponse room = roomService.getRoomForUpdateById(principal.getMemberId(),roomId);
        return ResponseEntity.status(HttpStatus.OK).body(room);
    }

    @PostMapping("/images/presign")
    public ResponseEntity<PresignResponse> presignImageUpload(@AuthenticationPrincipal AuthMemberPrincipal principal,
                                                              @RequestBody @Valid PresignRequest request) {
        PresignResponse response = s3PresignService.createUploadUrl(principal.getMemberId(), request);
        return ResponseEntity.ok(response);
    }

}
