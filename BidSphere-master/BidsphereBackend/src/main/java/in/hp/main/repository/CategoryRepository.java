package in.hp.main.repository;

import in.hp.main.model.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CategoryRepository extends JpaRepository<Category, Long> {
    
    /**
     * Find a category by its name (e.g., "Electronics").
     * Useful if you want to prevent duplicate categories.
     */
    Optional<Category> findByName(String name);
}