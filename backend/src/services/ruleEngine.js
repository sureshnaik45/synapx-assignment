function evaluateClaim(data) {
    const missingFields = [];

    // "If any mandatory field is missing - Manual review"
    const mandatory = [
        'policyNumber', 
        'policyHolderName', 
        'incidentDate', 
        'incidentDescription', 
        'claimType', 
        'estimatedDamage' 
    ];
    
    // Check for missing fields
    mandatory.forEach(field => {
        if (!data[field] || data[field] === "null" || data[field] === null) {
            missingFields.push(field);
        }
    });

    let route = "";
    let reason = "";
    
    const desc = (data.incidentDescription || "").toLowerCase();
    const type = (data.claimType || "").toLowerCase();
    const damage = data.estimatedDamage || 0;

    // 1. Fraud Check (Priority 1)
    if (desc.includes("fraud") || desc.includes("staged") || desc.includes("inconsistent") || desc.includes("suspicious")) {
        route = "Investigation Flag";
        reason = "Flagged for potential fraud indicators in description.";
    } 
    // 2. Missing Mandatory Fields (Priority 2)
    else if (missingFields.length > 0) {
        route = "Manual Review";
        reason = `Mandatory fields are missing: ${missingFields.join(', ')}`;
    } 
    // 3. Injury Check (Priority 3)
    else if (type.includes("bodily") || type.includes("injury") || desc.includes("medical") || desc.includes("hospital")) {
        route = "Specialist Queue";
        reason = "Claim involves bodily injury requiring medical specialist assessment.";
    } 
    // 4. High Value / Standard Processing (> $25k)
    else if (damage >= 25000) {
        route = "Standard Processing"; 
        reason = `High-value claim ($${damage.toLocaleString()}) exceeds Fast-track threshold ($25,000).`;
    }
    // 5. Fast Track (< $25k, clean)
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