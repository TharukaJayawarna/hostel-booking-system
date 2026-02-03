package com.hostel.hostel_backend.config;

import com.hostel.hostel_backend.service.UserCacheService;
import com.hostel.hostel_backend.util.JwtUtils;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import org.springframework.security.core.userdetails.UsernameNotFoundException;

import java.io.IOException;

@Component
@RequiredArgsConstructor
@Slf4j
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtUtils jwtUtils;
    private final UserDetailsService userDetailsService;
    private final UserCacheService userCacheService;

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain
    ) throws ServletException, IOException {

        final String authHeader = request.getHeader("Authorization");
        final String jwt;
        final String username;

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        try {
            jwt = authHeader.substring(7);
            username = jwtUtils.extractUsername(jwt);

            if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                try {
                    UserDetails userDetails = this.userDetailsService.loadUserByUsername(username);

                    if (jwtUtils.isTokenValid(jwt, userDetails)) {
                        String cachedStatus = userCacheService.getUserStatus(username);

                        boolean isLocked = false;
                        if (cachedStatus != null) {
                            // Use cached value
                            if ("LOCKED".equals(cachedStatus)) {
                                isLocked = true;
                            }
                        } else {
                            // Fallback to Database & Update Cache
                            if (!userDetails.isAccountNonLocked() || !userDetails.isEnabled()) {
                                isLocked = true;
                                userCacheService.cacheUserStatus(username, false);
                            } else {
                                userCacheService.cacheUserStatus(username, true);
                            }
                        }

                        if (isLocked) {
                            response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Account is locked");
                            return;
                        }
                        UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                                userDetails,
                                null,
                                userDetails.getAuthorities()
                        );
                        authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                        SecurityContextHolder.getContext().setAuthentication(authToken);
                    }
                } catch (UsernameNotFoundException e) {
                    log.error("User not found for token: {}", username);
                }
            }
        } catch (Exception e) {
            log.error("JWT Processing Error: {}", e.getMessage());
        }

        filterChain.doFilter(request, response);
    }
}