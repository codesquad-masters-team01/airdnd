package com.airdnd.room;


import com.airdnd.room.dto.HostRoomRequest;
import com.airdnd.room.dto.HostRoomResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/host/rooms")
public class HostRoomController {

    private final RoomService roomService;


    @PostMapping
    public ResponseEntity<Long> registerRoom(@RequestBody @Valid HostRoomRequest request) {

        Long roomId = roomService.registerRoom(request);

        return ResponseEntity.status(HttpStatus.CREATED).body(roomId);
    }


    @GetMapping
    public ResponseEntity<List<HostRoomResponse>> getAllRooms() {

        Long hostId = 1L; // TODO: 로그인 기능 구현시 교체
        return ResponseEntity.status(HttpStatus.OK).body(roomService.getRoomsByHostId(hostId));

    }
}
