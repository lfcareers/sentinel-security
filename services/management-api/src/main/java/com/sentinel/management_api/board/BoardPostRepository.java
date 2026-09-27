package com.sentinel.management_api.board;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface BoardPostRepository extends JpaRepository<BoardPostEntity, UUID> {

    List<BoardPostEntity> findTop20ByAuthorUserIdOrderByCreatedAtDesc(
            UUID authorUserId
    );
}