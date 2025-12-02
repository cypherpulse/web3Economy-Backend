# Web3 Economy Backend - Batch Commit Script
# This script commits each file independently with blockchain/Web3 themed messages

Write-Host "Starting Web3 Economy Backend batch commit process..."
Write-Host ""

$successCount = 0
$failCount = 0

function Commit-File {
    param([string]$file, [string]$message)

    Write-Host "Processing: $file"

    $status = git status --porcelain $file 2>$null

    if ($status) {
        git add $file 2>$null
        git commit -m $message 2>$null

        if ($LASTEXITCODE -eq 0) {
            Write-Host "   Committed successfully"
            return $true
        } else {
            Write-Host "   Failed to commit"
            return $false
        }
    } else {
        Write-Host "   Skipped (no changes)"
        return $null
    }
}

# Commit each file with Web3/blockchain themed messages
$results = @()

$results += Commit-File "tsconfig.json" "feat(config): add TypeScript configuration for Web3 community backend - blockchain technology development setup"
$results += Commit-File "src/config/database.ts" "feat(database): implement MongoDB connection for Web3 Economy decentralized community platform"
$results += Commit-File "src/config/index.ts" "feat(config): export database utilities for blockchain technology Web3 backend services"
$results += Commit-File "src/types/index.ts" "feat(types): define TypeScript interfaces for Web3 community blockchain platform entities"
$results += Commit-File "src/models/Admin.ts" "feat(models): create Admin schema with JWT auth for Web3 blockchain platform security"
$results += Commit-File "src/models/Event.ts" "feat(models): add Event model for Web3 community workshops and blockchain hackathons"
$results += Commit-File "src/models/Creator.ts" "feat(models): implement Creator schema for Web3 educators with blockchain creator coins"
$results += Commit-File "src/models/BuilderProject.ts" "feat(models): create BuilderProject model for Web3 blockchain technology showcases with TVL tracking"
$results += Commit-File "src/models/Resource.ts" "feat(models): add Resource schema for Web3 blockchain education and onchain learning materials"
$results += Commit-File "src/models/ContactSubmission.ts" "feat(models): implement contact form model for Web3 blockchain community engagement"
$results += Commit-File "src/models/NewsletterSubscriber.ts" "feat(models): create newsletter model for Web3 blockchain technology community updates"
$results += Commit-File "src/models/Blog.ts" "feat(models): add Blog schema for Web3 blockchain content publishing platform"
$results += Commit-File "src/models/Showcase.ts" "feat(models): implement Showcase model for DeFi NFT DAO blockchain projects on Web3 Economy"
$results += Commit-File "src/models/index.ts" "feat(models): export all Mongoose models for Web3 blockchain technology platform"
$results += Commit-File "src/middleware/auth.ts" "feat(middleware): add JWT authentication for Web3 blockchain admin routes protection"
$results += Commit-File "src/middleware/cors.ts" "feat(middleware): configure CORS for Web3 blockchain frontend dApp integration"
$results += Commit-File "src/middleware/errorHandler.ts" "feat(middleware): implement error handling for Web3 blockchain API responses"
$results += Commit-File "src/middleware/rateLimiter.ts" "feat(middleware): add rate limiting for Web3 blockchain API endpoint protection"
$results += Commit-File "src/middleware/index.ts" "feat(middleware): export all middleware for Web3 blockchain technology backend"
$results += Commit-File "src/services/emailService.ts" "feat(services): add email service for Web3 blockchain community notifications"
$results += Commit-File "src/services/cloudinaryService.ts" "feat(services): implement Cloudinary for Web3 blockchain platform media storage"
$results += Commit-File "src/services/index.ts" "feat(services): export all services for Web3 blockchain technology platform"
$results += Commit-File "src/controllers/adminController.ts" "feat(controllers): add admin controller for Web3 blockchain platform governance"
$results += Commit-File "src/controllers/eventController.ts" "feat(controllers): create event controller for Web3 blockchain community gatherings"
$results += Commit-File "src/controllers/creatorController.ts" "feat(controllers): implement creator controller for Web3 blockchain educators"
$results += Commit-File "src/controllers/builderController.ts" "feat(controllers): add builder controller for Web3 blockchain project showcases"
$results += Commit-File "src/controllers/resourceController.ts" "feat(controllers): create resource controller for Web3 blockchain education platform"
$results += Commit-File "src/controllers/contactController.ts" "feat(controllers): implement contact controller for Web3 blockchain community inquiries"
$results += Commit-File "src/controllers/newsletterController.ts" "feat(controllers): add newsletter controller for Web3 blockchain technology updates"
$results += Commit-File "src/controllers/blogController.ts" "feat(controllers): create blog controller for Web3 blockchain content management"
$results += Commit-File "src/controllers/showcaseController.ts" "feat(controllers): implement showcase controller for Web3 DeFi NFT blockchain projects"
$results += Commit-File "src/controllers/index.ts" "feat(controllers): export all controllers for Web3 blockchain technology API"
$results += Commit-File "src/routes/adminRoutes.ts" "feat(routes): add admin routes for Web3 blockchain platform authentication"
$results += Commit-File "src/routes/eventRoutes.ts" "feat(routes): create event routes for Web3 blockchain community activities"
$results += Commit-File "src/routes/creatorRoutes.ts" "feat(routes): add creator routes for Web3 blockchain educator profiles"
$results += Commit-File "src/routes/builderRoutes.ts" "feat(routes): implement builder routes for Web3 blockchain project showcase"
$results += Commit-File "src/routes/resourceRoutes.ts" "feat(routes): create resource routes for Web3 blockchain learning platform"
$results += Commit-File "src/routes/contactRoutes.ts" "feat(routes): add contact routes for Web3 blockchain community engagement"
$results += Commit-File "src/routes/newsletterRoutes.ts" "feat(routes): create newsletter routes for Web3 blockchain subscriptions"
$results += Commit-File "src/routes/blogRoutes.ts" "feat(routes): implement blog routes for Web3 blockchain content platform"
$results += Commit-File "src/routes/showcaseRoutes.ts" "feat(routes): add showcase routes for Web3 DeFi NFT DAO blockchain highlights"
$results += Commit-File "src/routes/index.ts" "feat(routes): export all routes for Web3 blockchain Economy API"
$results += Commit-File "src/scripts/seed.ts" "feat(scripts): add database seeder for Web3 blockchain platform demo data"
$results += Commit-File "src/server.ts" "feat(server): implement Express server for Web3 Economy blockchain community API"
$results += Commit-File "README.md" "docs: update README for Web3 Economy blockchain community platform documentation"
$results += Commit-File "package.json" "feat: add package.json with dependencies for Web3 blockchain backend - Node.js 18+ Express MongoDB"
$results += Commit-File "pnpm-lock.yaml" "feat: add pnpm lockfile for Web3 blockchain technology project dependency management"
$results += Commit-File ".gitignore" "feat: add gitignore for Web3 Economy backend - exclude node_modules and sensitive files"
$results += Commit-File ".env" "feat: add environment variables for Web3 blockchain platform configuration"
$results += Commit-File "app.http" "feat: add HTTP requests file for Web3 Economy API testing and blockchain community development"

$successCount = ($results | Where-Object { $_ -eq $true }).Count
$failCount = ($results | Where-Object { $_ -eq $false }).Count

Write-Host ""
Write-Host "=================================================="
Write-Host "Batch commit complete!"
Write-Host "   Successful: $successCount"
Write-Host "   Failed: $failCount"
Write-Host "=================================================="
Write-Host ""
Write-Host "Run git log --oneline -50 to see all commits"
