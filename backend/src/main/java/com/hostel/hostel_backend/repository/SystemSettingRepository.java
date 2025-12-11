package com.hostel.hostel_backend.repository;

import com.hostel.hostel_backend.model.SystemSetting;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SystemSettingRepository extends JpaRepository<SystemSetting, String> {
}