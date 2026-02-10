# Trial Room Logic Revert

I have reverted the `TrialRoom` usage of the debate API as requested.

## Changes
-   **Removed Streaming**: The `runDebateStream` call has been replaced with the standard `runDebate` API call.
-   **Restored Step-by-Step Display**: The logic now fetches the full transcript first, then iterates through it with a simulated delay (`800ms`) to display the conversation cards one by one, which is the "normal" behavior you previously had.

## Verification
-   The code in `TrialRoom.tsx` now uses `await getApiClient().runDebate(session.id)`.
-   The streaming parser logic has been removed.

Note: If you encounter any dependency issues (as seen in the logs), please run `npm install` in your terminal.
