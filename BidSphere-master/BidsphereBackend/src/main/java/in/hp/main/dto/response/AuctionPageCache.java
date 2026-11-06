package in.hp.main.dto.response;

import lombok.Getter;
import lombok.Setter;

import java.util.List;


public class AuctionPageCache {

    private List<AuctionResponse> content;
    private int pageNumber;
    private int pageSize;
    private long totalElements;
    private int totalPages;

    public AuctionPageCache() {
    }

    public AuctionPageCache(
            List<AuctionResponse> content,
            int pageNumber,
            int pageSize,
            long totalElements,
            int totalPages) {
        this.content = content;
        this.pageNumber = pageNumber;
        this.pageSize = pageSize;
        this.totalElements = totalElements;
        this.totalPages = totalPages;
    }

    public List<AuctionResponse> getContent() {
        return content;
    }

    public void setContent(List<AuctionResponse> content) {
        this.content = content;
    }

    public int getPageNumber() {
        return pageNumber;
    }

    public void setPageNumber(int pageNumber) {
        this.pageNumber = pageNumber;
    }

    public int getPageSize() {
        return pageSize;
    }

    public void setPageSize(int pageSize) {
        this.pageSize = pageSize;
    }

    public long getTotalElements() {
        return totalElements;
    }

    public void setTotalElements(long totalElements) {
        this.totalElements = totalElements;
    }

    public int getTotalPages() {
        return totalPages;
    }

    public void setTotalPages(int totalPages) {
        this.totalPages = totalPages;
    }
}