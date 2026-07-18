package com.aggarjan.patrika.parichay.modules.metadata.service;

import com.aggarjan.patrika.parichay.modules.metadata.dto.ActionDto;

import java.util.List;

public interface ActionService {
    List<ActionDto> getActionsByModuleAndStatus(String module, Long statusId);
}
