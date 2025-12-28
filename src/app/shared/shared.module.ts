import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { GoogleSigninButtonComponent } from './components/google-signin-button/google-signin-button.component';
import { AIAssistantComponent } from './components/ai-assistant/ai-assistant.component';
import { FooterComponent } from './components/footer/footer.component';
import { GlassMenuComponent } from './components/glass-menu/glass-menu.component';
import { HeaderComponent } from './components/header/header.component';
import { IndiaMapComponent } from './components/india-map/india-map.component';
import { NotificationsComponent } from './components/notifications/notifications.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { SymptomCheckerComponent } from './components/symptom-checker/symptom-checker.component';
import { UserCardComponent } from './components/user-card/user-card.component';

// UI Components
import {
  AlertComponent,
  AlertDescriptionComponent,
  AlertTitleComponent,
} from './components/ui/alert.component';
import { BadgeComponent } from './components/ui/badge.component';
import { ButtonDirective } from './components/ui/button.directive';
import {
  CardComponent,
  CardContentComponent,
  CardDescriptionComponent,
  CardFooterComponent,
  CardHeaderComponent,
  CardTitleComponent,
} from './components/ui/card.component';
import {
  DialogComponent,
  DialogDescriptionComponent,
  DialogFooterComponent,
  DialogHeaderComponent,
  DialogTitleComponent,
} from './components/ui/dialog.component';
import { InputDirective, LabelDirective, TextareaDirective } from './components/ui/input.directive';
import { SeparatorComponent } from './components/ui/separator.component';
import { SkeletonComponent } from './components/ui/skeleton.component';
import {
  TableBodyDirective,
  TableCaptionComponent,
  TableCellDirective,
  TableComponent,
  TableFooterDirective,
  TableHeadDirective,
  TableHeaderDirective,
  TableRowDirective,
} from './components/ui/table.component';
import { TabComponent, TabContentComponent, TabsComponent } from './components/ui/tabs.component';
import { ToastComponent, ToasterComponent } from './components/ui/toast.component';

const UI_COMPONENTS = [
  ButtonDirective,
  CardComponent,
  CardHeaderComponent,
  CardTitleComponent,
  CardDescriptionComponent,
  CardContentComponent,
  CardFooterComponent,
  InputDirective,
  LabelDirective,
  TextareaDirective,
  BadgeComponent,
  DialogComponent,
  DialogHeaderComponent,
  DialogTitleComponent,
  DialogDescriptionComponent,
  DialogFooterComponent,
  ToastComponent,
  ToasterComponent,
  SkeletonComponent,
  TableComponent,
  TableHeaderDirective,
  TableBodyDirective,
  TableFooterDirective,
  TableRowDirective,
  TableHeadDirective,
  TableCellDirective,
  TableCaptionComponent,
  TabsComponent,
  TabComponent,
  TabContentComponent,
  SeparatorComponent,
  AlertComponent,
  AlertTitleComponent,
  AlertDescriptionComponent,
];

@NgModule({
  declarations: [
    HeaderComponent,
    FooterComponent,
    SidebarComponent,
    AIAssistantComponent,
    SymptomCheckerComponent,
    GlassMenuComponent,
    IndiaMapComponent,
    UserCardComponent,
  ],
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    GoogleSigninButtonComponent,
    NotificationsComponent,
    ...UI_COMPONENTS,
  ],
  exports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    HeaderComponent,
    FooterComponent,
    SidebarComponent,
    AIAssistantComponent,
    SymptomCheckerComponent,
    GlassMenuComponent,
    IndiaMapComponent,
    UserCardComponent,
    ...UI_COMPONENTS,
  ],
})
export class SharedModule { }

/*
@startuml

!define RECTANGLE class
!define DATABASE class
!define INTERFACE interface

RECTANGLE User {
  +id: String
  +name: String
  +email: String
}

RECTANGLE Doctor {
  +id: String
  +name: String
  +specialization: String
}

RECTANGLE Appointment {
  +id: String
  +userId: String
  +doctorId: String
  +date: Date
  +time: Time
}

RECTANGLE HealthRecord {
  +id: String
  +userId: String
  +recordDetails: String
  +date: Date
}

DATABASE Database {
  +connect()
  +query()
}

INTERFACE API {
  +getUser()
  +getDoctor()
  +createAppointment()
  +getHealthRecord()
}

User --> Appointment : books > 
Doctor --> Appointment : sees > 
User --> HealthRecord : has > 

API --> User : interacts with > 
API --> Doctor : interacts with > 
API --> Appointment : interacts with > 
API --> HealthRecord : interacts with > 

Database --> API : stores data > 

@enduml
*/
