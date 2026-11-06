package in.hp.main.model;

public enum Permissions {
    // User / Bidder Permissions
    PROFILE_READ,
    PROFILE_UPDATE,
    BID_CREATE,
    BID_READ,

    // Seller Permissions
    AUCTION_CREATE,
    AUCTION_UPDATE,
    AUCTION_DELETE,

    // Admin Permissions
    USER_MANAGE,
    SYSTEM_READ,
    ALL_AUCTION_MANAGE
}