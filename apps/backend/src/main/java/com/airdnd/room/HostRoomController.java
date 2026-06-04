package com.airdnd.room;


import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
public class HostRoomController {

    private final RoomService roomService;

    @PostMapping("/api/host/rooms")
    public ResponseEntity<Long> registerRoom(@RequestBody @Valid HostRoomRequest hostRoomRequest) {

        Long roomId = roomService.registerRoom(hostRoomRequest);

        return ResponseEntity.status(HttpStatus.CREATED).body(roomId);
    }

}
