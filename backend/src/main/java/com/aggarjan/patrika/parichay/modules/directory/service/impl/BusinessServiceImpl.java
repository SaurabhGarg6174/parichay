package com.aggarjan.patrika.parichay.modules.directory.service.impl;

import com.aggarjan.patrika.parichay.modules.directory.model.BusinessListing;
import com.aggarjan.patrika.parichay.modules.directory.repository.BusinessListingRepo;
import com.aggarjan.patrika.parichay.modules.directory.service.BusinessService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.List;

@Service
@RequiredArgsConstructor
public class BusinessServiceImpl implements BusinessService {
    private final BusinessListingRepo businessListingRepo;

    @Override
    public List<BusinessListing> getAllActiveListings() {
        return businessListingRepo.findAllByIsActiveTrue();
    }

    @Override
    public List<BusinessListing> getListingsByCategory(String category) {
        return businessListingRepo.findAllByCategoryAndIsActiveTrue(category);
    }

    @Override
    public BusinessListing saveListing(BusinessListing listing) {
        return businessListingRepo.save(listing);
    }

    @Override
    public BusinessListing getRandomListing() {
        List<BusinessListing> listings = getAllActiveListings();
        if (listings.isEmpty()) return null;
        Collections.shuffle(listings);
        return listings.get(0);
    }
}
