export type SecurityAlert = {
    action: string
    alertId: string
    createdAt: string
    description: string
    hostId: string
    processId: number | null
    riskScore: number
    ruleId: string
    severity: string
    sourceEventId: string
    title: string
}