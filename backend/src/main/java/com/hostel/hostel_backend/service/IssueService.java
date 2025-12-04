package com.hostel.hostel_backend.service;

import com.hostel.hostel_backend.controller.request.CreateIssueRequestDTO;

public interface IssueService {
    void reportIssue(CreateIssueRequestDTO dto);
}
