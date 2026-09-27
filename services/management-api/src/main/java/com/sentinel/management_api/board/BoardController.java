package com.sentinel.management_api.board;

import com.sentinel.management_api.account.SentinelUserService;
import org.springframework.context.annotation.Profile;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.web.bind.annotation.*;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@Profile("auth")
@RequestMapping("/api/board/posts")
public class BoardController {

    private final BoardPostRepository posts;
    private final SentinelUserService users;

    public BoardController(BoardPostRepository posts, SentinelUserService users) {
        this.posts = posts;
        this.users = users;
    }

    public record CreatePostRequest(String title, String body) {}

    public record PostResponse(
            UUID postId,
            String title,
            String body,
            String status,
            OffsetDateTime createdAt
    ) {}

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public PostResponse create(
            @AuthenticationPrincipal OidcUser identity,
            @RequestBody CreatePostRequest request
    ) {
        String title = request.title() == null ? "" : request.title().trim();
        String body = request.body() == null ? "" : request.body().trim();

        if (title.isEmpty() || title.length() > 160) {
            throw new IllegalArgumentException("Title must be 1–160 characters.");
        }
        if (body.isEmpty() || body.length() > 10000) {
            throw new IllegalArgumentException("Post must be 1–10000 characters.");
        }

        UUID authorId = users.findAccount(identity).getUserId();
        return response(posts.save(new BoardPostEntity(authorId, title, body)));
    }

    @GetMapping("/mine")
    public List<PostResponse> mine(@AuthenticationPrincipal OidcUser identity) {
        UUID authorId = users.findAccount(identity).getUserId();
        return posts.findTop20ByAuthorUserIdOrderByCreatedAtDesc(authorId)
                .stream()
                .map(this::response)
                .toList();
    }

    @ResponseStatus(HttpStatus.BAD_REQUEST)
    @ExceptionHandler(IllegalArgumentException.class)
    public Map<String, String> invalidPost(IllegalArgumentException exception) {
        return Map.of("error", exception.getMessage());
    }

    private PostResponse response(BoardPostEntity post) {
        return new PostResponse(
                post.getPostId(),
                post.getTitle(),
                post.getBody(),
                post.getStatus(),
                post.getCreatedAt()
        );
    }
}