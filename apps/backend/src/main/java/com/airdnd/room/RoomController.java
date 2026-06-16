package com.airdnd.room;

import com.airdnd.auth.AuthMemberPrincipal;
import com.airdnd.room.dto.RoomDetailResponse;
import com.airdnd.room.dto.RoomResponse;
import com.airdnd.room.dto.RoomSearchRequestDto;
import com.airdnd.room.dto.RoomUpdateRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/rooms")
public class RoomController {

    private final RoomService roomService;

    @GetMapping
    public ResponseEntity<List<RoomResponse>> getRooms(@Valid @ModelAttribute RoomSearchRequestDto searchConditions) {
        List<RoomResponse> rooms = roomService.getRooms(searchConditions);
        return ResponseEntity.status(HttpStatus.OK).body(rooms);
    }

    @GetMapping("/{roomId}")
    public ResponseEntity<RoomDetailResponse> getRoom(@PathVariable Long roomId) {
        RoomDetailResponse room = roomService.getRoomById(roomId);
        return ResponseEntity.status(HttpStatus.OK).body(room);
    }

    @PatchMapping("/{roomId}")
    public ResponseEntity<RoomDetailResponse> updateRoom(@PathVariable Long roomId,
                                                         @AuthenticationPrincipal AuthMemberPrincipal principal,
                                                         @Valid @RequestBody RoomUpdateRequest request) {
        RoomDetailResponse updatedRoom = roomService.updateRoomDetails(principal.getMemberId(),roomId,request);
        return ResponseEntity.status(HttpStatus.OK).body(updatedRoom);
    }



}
