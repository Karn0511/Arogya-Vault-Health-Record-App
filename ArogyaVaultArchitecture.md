# Arogya Vault Architecture Diagram

@startuml ArogyaVaultArchitecture

package "Arogya Vault" {
    [Frontend] --> [Backend]
    [Backend] --> [Database]
    
    package "Frontend" {
        [App Module] --> [Core Module]
        [App Module] --> [Features]
        [App Module] --> [Shared Module]
        
        package "Core Module" {
            [Auth Guard]
            [Role Guard]
            [Auth Interceptor]
        }
        
        package "Features" {
            [Admin Feature]
            [Appointments Feature]
            [Auth Feature]
            [Doctor Feature]
            [Patient Feature]
            [Sharing Feature]
        }
        
        package "Shared Module" {
            [Components]
            [Services]
            [UI]
        }
    }

    package "Backend" {
        [Routes] --> [Services]
        [Services] --> [Models]
        
        package "Routes" {
            [Admin Route]
            [Advanced Features Route]
            [File Storage Route]
        }
        
        package "Services" {
            [Auto Deletion Service]
            [Gemini AI Service]
            [Phone Email OTP Service]
            [S3 Service]
        }
        
        package "Models" {
            [User Model]
            [Doctor Model]
            [Appointment Model]
            [Health Records Model]
            [Notification Model]
            [Prescription Model]
        }
    }

    package "Database" {
        [Database]
        [Seed Fixed Script]
    }
}

@enduml
