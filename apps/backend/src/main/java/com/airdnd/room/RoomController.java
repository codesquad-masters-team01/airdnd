package com.airdnd.room;

import com.airdnd.room.dto.RoomResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/rooms")
public class RoomController {

    private final RoomService roomService;

    @GetMapping
    public ResponseEntity<List<RoomResponse>> getRooms() {
        List<RoomResponse> rooms = roomService.getRooms();
        return ResponseEntity.status(HttpStatus.OK).body(rooms);
    }

}
