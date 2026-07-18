package com.aggarjan.patrika.parichay.modules.auth.service;

import com.aggarjan.patrika.parichay.modules.auth.dto.AuthenticationRequest;
import com.aggarjan.patrika.parichay.modules.auth.dto.AuthenticationResponse;
import com.aggarjan.patrika.parichay.modules.auth.dto.ChangePasswordRequest;
import com.aggarjan.patrika.parichay.modules.auth.dto.RegisterRequest;
import com.aggarjan.patrika.parichay.modules.auth.dto.ResetPasswordRequest;
import com.aggarjan.patrika.parichay.modules.auth.dto.UserDto;

public interface AuthenticationService {

    AuthenticationResponse register(RegisterRequest request);

    AuthenticationResponse authenticate(AuthenticationRequest request);

    void changePassword(ChangePasswordRequest request, String email);

    UserDto getCurrentUser(String email);

    AuthenticationResponse refreshToken(String rawRefreshToken);

    void logout(String rawRefreshToken);

    void forgotPassword(String email);

    void resetPassword(ResetPasswordRequest request);
}
