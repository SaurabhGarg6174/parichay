package com.aggarjan.patrika.parichay.modules.profile.repo;

import com.aggarjan.patrika.parichay.modules.profile.model.BioData;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface BioDataRepo extends JpaRepository<BioData, Long> {
}
