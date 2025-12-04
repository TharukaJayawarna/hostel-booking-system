package com.hostel.hostel_backend.service;

import com.hostel.hostel_backend.controller.dto.IssueDTO;

public interface IssueService {
    void reportIssue(IssueDTO dto);
}
