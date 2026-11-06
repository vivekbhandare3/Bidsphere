package in.hp.main.model;

import java.util.Set;

public enum Role {

    // Standard users can manage their profile and place bids
    USER(Set.of(
            Permissions.PROFILE_READ,
            Permissions.PROFILE_UPDATE,
            Permissions.BID_CREATE,
            Permissions.BID_READ
    )),

    // Sellers can do everything a User can do, PLUS manage their own auctions
    SELLER(Set.of(
            Permissions.PROFILE_READ,
            Permissions.PROFILE_UPDATE,
            Permissions.BID_CREATE,
            Permissions.BID_READ,
            Permissions.AUCTION_CREATE,
            Permissions.AUCTION_UPDATE,
            Permissions.AUCTION_DELETE
    )),

    // Admins have overarching control over the system and users
    ADMIN(Set.of(
            Permissions.PROFILE_READ,
            Permissions.USER_MANAGE,
            Permissions.SYSTEM_READ,
            Permissions.ALL_AUCTION_MANAGE
    ));

    private final Set<Permissions> permissions;

    Role(Set<Permissions> permissions) {
        this.permissions = permissions;
    }

    public Set<Permissions> getPermissions() {
        return permissions;
    }
}