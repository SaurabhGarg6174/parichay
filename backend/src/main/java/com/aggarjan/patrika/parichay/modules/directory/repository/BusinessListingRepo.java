package com.aggarjan.patrika.parichay.modules.directory.repository;

import com.aggarjan.patrika.parichay.modules.directory.model.BusinessListing;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BusinessListingRepo extends JpaRepository<BusinessListing, Long> {
    List<BusinessListing> findAllByIsActiveTrue();
    List<BusinessListing> findAllByCategoryAndIsActiveTrue(String category);
}
