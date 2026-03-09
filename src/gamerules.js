export const reveal_rounds = [3, 8, 13, 18, 24]

export function isRevealRound(round) {
    return reveal_rounds.includes(round)
}

export function isMrX(role) {
    return role == "MRX"
}