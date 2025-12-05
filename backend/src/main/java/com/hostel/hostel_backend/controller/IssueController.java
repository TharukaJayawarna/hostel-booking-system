package com.hostel.hostel_backend.controller;

import com.hostel.hostel_backend.controller.dto.IssueDTO;
import com.hostel.hostel_backend.controller.response.ApiResponse;
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
    public ResponseEntity<ApiResponse<String>> createIssue(@RequestBody IssueDTO dto) {
        issueService.reportIssue(dto);
        return ResponseEntity.ok(ApiResponse.success("Issue forwarded to admins successfully!"));
    }


}
