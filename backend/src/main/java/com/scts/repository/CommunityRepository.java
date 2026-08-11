package com.scts.repository;

import com.scts.entity.Community;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CommunityRepository extends JpaRepository<Community, Long> {
    Optional<Community> findByName(String name);
    Boolean existsByName(String name);
    List<Community> findByStatus(String status);
    List<Community> findByCoordinatorUserId(Long coordinatorUserId);

    @Query("SELECT c FROM Community c WHERE " +
           "LOWER(c.name) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(c.category) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(c.description) LIKE LOWER(CONCAT('%', :query, '%'))")
    List<Community> searchCommunities(@Param("query") String query);

    @Modifying
    @Query(value = "DELETE FROM event_registrations WHERE event_id IN (SELECT id FROM events WHERE community_id = :id)", nativeQuery = true)
    void deleteRegistrationsByCommunityId(@Param("id") Long id);

    @Modifying
    @Query(value = "DELETE FROM attendance WHERE event_id IN (SELECT id FROM events WHERE community_id = :id)", nativeQuery = true)
    void deleteAttendanceByCommunityId(@Param("id") Long id);

    @Modifying
    @Query(value = "DELETE FROM events WHERE community_id = :id", nativeQuery = true)
    void deleteEventsByCommunityId(@Param("id") Long id);

    @Modifying
    @Query(value = "DELETE FROM task_submissions WHERE task_assignment_id IN (SELECT id FROM task_assignments WHERE community_id = :id)", nativeQuery = true)
    void deleteSubmissionsByCommunityId(@Param("id") Long id);

    @Modifying
    @Query(value = "DELETE FROM task_assignments WHERE community_id = :id", nativeQuery = true)
    void deleteAssignmentsByCommunityId(@Param("id") Long id);

    @Modifying
    @Query(value = "DELETE FROM memberships WHERE community_id = :id", nativeQuery = true)
    void deleteMembershipsByCommunityId(@Param("id") Long id);

    @Modifying
    @Query(value = "DELETE FROM activity_requests WHERE community_id = :id", nativeQuery = true)
    void deleteActivityRequestsByCommunityId(@Param("id") Long id);

    @Modifying
    @Query(value = "DELETE FROM announcements WHERE community_id = :id", nativeQuery = true)
    void deleteAnnouncementsByCommunityId(@Param("id") Long id);

    @Modifying
    @Query(value = "DELETE FROM community_resources WHERE community_id = :id", nativeQuery = true)
    void deleteResourcesByCommunityId(@Param("id") Long id);
}
