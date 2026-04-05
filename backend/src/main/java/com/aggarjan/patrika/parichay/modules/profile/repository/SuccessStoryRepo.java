package com.aggarjan.patrika.parichay.modules.profile.repository;

import com.aggarjan.patrika.parichay.modules.profile.model.SuccessStory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SuccessStoryRepo extends JpaRepository<SuccessStory, Long> {
    List<SuccessStory> findAllByIsActiveTrue();
}
