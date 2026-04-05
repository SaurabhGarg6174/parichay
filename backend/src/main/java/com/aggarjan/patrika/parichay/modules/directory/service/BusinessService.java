package com.aggarjan.patrika.parichay.modules.directory.service;

import com.aggarjan.patrika.parichay.modules.directory.model.BusinessListing;
import java.util.List;

public interface BusinessService {
    List<BusinessListing> getAllActiveListings();
    List<BusinessListing> getListingsByCategory(String category);
    BusinessListing saveListing(BusinessListing listing);
    BusinessListing getRandomListing(); // Used for showing random ads
}
