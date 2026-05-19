# Security Specification - Wedding RSVP

## 1. Data Invariants
- An RSVP must have a valid name, email, attendance status, and guest count.
- `createdAt` must be the server timestamp.
- Guests can only create an RSVP; they cannot read, update, or delete existing RSVPs (to protect other guests' privacy).
- Admin access (if needed later) would be used for viewing all RSVPs.

## 2. The "Dirty Dozen" Payloads (Deny Cases)
1. **Identity Spoofing**: Attempting to set `ownerId` (if it existed) to someone else.
2. **Missing Fields**: Creating an RSVP without a `name`.
3. **Invalid Attendance**: Setting `attendance` to "maybe".
4. **Invalid Guest Count**: Setting `guests` to -1.
5. **Huge Payload**: Injecting 1MB of text into the `dietary` field.
6. **Client Timestamp**: Providing a `createdAt` date from the client instead of using `request.time`.
7. **Read Attempt**: An unauthenticated user attempting to list all RSVPs.
8. **Delete Attempt**: A guest attempting to delete another guest's RSVP.
9. **Update Attempt**: A guest attempting to change their RSVP after submission (unless we explicitly allow self-updates, which we aren't for simplicity/security initially).
10. **ID Poisoning**: Using a 2KB string as a document ID.
11. **Shadow Fields**: Adding an `isVerified: true` field to the RSVP.
12. **Relational Sync Break**: Creating an RSVP with a reference to a non-existent event ID (if we had one).

## 3. Test Runner (Draft)
A `firestore.rules.test.ts` would typically be used to verify these, but since I'm an AI agent, I will ensure the logic in `firestore.rules` handles these cases.
