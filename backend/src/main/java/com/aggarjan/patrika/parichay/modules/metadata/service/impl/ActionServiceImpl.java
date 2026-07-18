package com.aggarjan.patrika.parichay.modules.metadata.service.impl;

import com.aggarjan.patrika.parichay.modules.metadata.dto.ActionDto;
import com.aggarjan.patrika.parichay.modules.metadata.model.Action;
import com.aggarjan.patrika.parichay.modules.metadata.repository.ActionRepo;
import com.aggarjan.patrika.parichay.modules.metadata.service.ActionService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ActionServiceImpl implements ActionService {

    private final ActionRepo actionRepo;

    @Override
    public List<ActionDto> getActionsByModuleAndStatus(String module, Long statusId) {
        List<Action> actions;
        if (statusId != null) {
            actions = actionRepo.findByTargetModuleAndTargetStatusIdAndActiveTrueOrderBySortOrderAsc(module, statusId);
        } else {
            actions = actionRepo.findByTargetModuleAndActiveTrueOrderBySortOrderAsc(module);
        }
        return actions.stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    private ActionDto mapToDto(Action action) {
        return ActionDto.builder()
                .id(action.getId())
                .label(action.getLabel())
                .code(action.getCode())
                .icon(action.getIcon())
                .color(action.getColor())
                .targetModule(action.getTargetModule())
                .targetStatusId(action.getTargetStatusId())
                .sortOrder(action.getSortOrder())
                .build();
    }
}
