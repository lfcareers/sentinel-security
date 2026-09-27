package com.sentinel.management_api.board;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "board_posts")
public class BoardPostEntity {

    @Id
    @Column(name = "post_id", nullable = false)
    private UUID postId;

    @Column(name = "author_user_id", nullable = false)
    private UUID authorUserId;

    @Column(name = "title", nullable = false, length = 160)
    private String title;

    @Column(name = "body", nullable = false, columnDefinition = "text")
    private String body;

    @Column(name = "status", nullable = false, length = 20)
    private String status;

    @Column(name = "created_at", nullable = false)
    private OffsetDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;

    protected BoardPostEntity() {
    }

    public BoardPostEntity(UUID authorUserId, String title, String body) {
        OffsetDateTime now = OffsetDateTime.now();

        this.postId = UUID.randomUUID();
        this.authorUserId = authorUserId;
        this.title = title;
        this.body = body;
        this.status = "PENDING";
        this.createdAt = now;
        this.updatedAt = now;
    }

    public UUID getPostId() { return postId; }
    public UUID getAuthorUserId() { return authorUserId; }
    public String getTitle() { return title; }
    public String getBody() { return body; }
    public String getStatus() { return status; }
    public OffsetDateTime getCreatedAt() { return createdAt; }
}