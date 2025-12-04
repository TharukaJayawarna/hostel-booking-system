package com.hostel.hostel_backend.controller;

import com.hostel.hostel_backend.controller.request.CreateIssueRequestDTO;
import com.hostel.hostel_backend.service.IssueService;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
@AllArgsConstructor
@CrossOrigin(origins = "*")
public class IssueController {

    private IssueService issueService;

    @PostMapping(value = "/issues", headers = "X-Api-Version=v1")
    public ResponseEntity<String> createIssue(@RequestBody CreateIssueRequestDTO dto) {
        issueService.reportIssue(dto);
        return ResponseEntity.ok("Issue forwarded to admins successfully!");
    }


}
