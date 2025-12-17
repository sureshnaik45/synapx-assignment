function evaluateClaim(data) {
    const missingFields = [];

    // Reject garbage files
    if (!data.policyNumber && !data.estimatedDamage && !data.incidentDate) {
        return {
            recommendedRoute: "Rejected",
            reasoning: "The uploaded document does not appear to be a valid insurance claim.",
            missingFields: []
        };
    }

    // Mandatory Fields
    const mandatory = [
        'policyNumber', 
        'policyHolderName', 
        'incidentDate', 
        'incidentDescription', 
        'estimatedDamage',
        'claimType'
    ];
    
    mandatory.forEach(field => {
        if (!data[field] || data[field] === "null" || data[field] === "") {
            missingFields.push(field);
        }
    });

    // Prepare Data for Logic
    const desc = (data.incidentDescription || "").toLowerCase();
    const type = (data.claimType || "").toLowerCase();
    const damage = data.estimatedDamage || 0;

    const fraudKeywords = [
        "fraud", "staged", "inconsistent", "suspicious", "flagged", 
        "conflicting", "fled", "pattern", "investigation"
    ];

    const injuryKeywords = [
        "bodily", "injury", "medical", "hospital", "doctor", "pain", 
        "whiplash", "ambulance", "paramedic", "treatment", "sore", "stiffness"
    ];

    let route = "";
    let reason = "";

    // Fraud Check - check if ANY fraud keyword exists in description OR claim type
    const isFraud = fraudKeywords.some(word => desc.includes(word) || type.includes(word));

    // Injury Check (Logic checks this before value)
    const isInjury = injuryKeywords.some(word => desc.includes(word) || type.includes(word));

    if (isFraud) {
        route = "Investigation Flag";
        reason = "Flagged for potential fraud indicators (e.g., 'staged', 'inconsistent') in description.";
    } 
    else if (missingFields.length > 0) {
        route = "Manual Review";
        reason = `Mandatory fields are missing: ${missingFields.join(', ')}`;
    } 
    else if (isInjury) {
        route = "Specialist Queue";
        reason = "Claim involves bodily injury or medical attention.";
    } 
    else if (damage >= 25000) {
        route = "Standard Processing"; 
        reason = `High-value claim ($${damage.toLocaleString()}) exceeds Fast-track threshold.`;
    }
    else {
        route = "Fast-track";
        reason = "Clean claim under $25,000 threshold with no flags.";
    }

    return { 
        recommendedRoute: route, 
        reasoning: reason, 
        missingFields 
    };
}

module.exports = { evaluateClaim };