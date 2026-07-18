package com.aggarjan.patrika.parichay.modules.metadata.service;

import com.aggarjan.patrika.parichay.modules.metadata.model.Lookup;

import java.util.List;
import java.util.Map;

public interface LookupService {
    List<Lookup> getByCategory(String category);

    Map<String, List<Lookup>> getAllGroupedByCategory();
}
