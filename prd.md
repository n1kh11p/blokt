Construction AI Field Intelligence Platform
Formal Product Design Document (PDD)
Version 1.0
Confidential – Internal Use Only

1. Executive Summary
This document defines the product design for a construction intelligence platform that converts unstructured field activity into structured, timestamped, analyzable task data aligned with project intent.
The platform integrates with Procore to ingest project metadata, short-term schedule context, and daily logs. It processes worker bodycam video using computer vision and temporal modeling to detect tasks, measure execution efficiency, and identify safety risks.
The system enables construction teams to determine whether daily execution matched planned intent, while automating documentation and improving safety visibility.

2. Product Vision
Enable construction teams to objectively evaluate daily execution performance by comparing planned intent with observed field activity.
Construction sites generate large volumes of unstructured data:
Video


Verbal instructions


Movement patterns


Safety behaviors


Today, only a fraction becomes structured data in systems such as Procore. This product bridges that gap by translating physical activity into structured operational intelligence.

3. Product Objectives
Automate task documentation through AI.


Align observed work with short-term schedule intent.


Provide measurable execution alignment metrics.


Improve OSHA safety compliance monitoring.


Deliver analytics on efficiency and variance.


Reduce manual daily logging burden.



4. User Personas
4.1 Project Manager (PM)
Needs:
Daily win/loss summary


Execution vs planned comparison


Safety compliance metrics


Cross-project benchmarking


4.2 Foreman
Needs:
Ability to assign micro-tasks


Validation that tasks were completed


Visibility into worker efficiency


Safety alerts in real time


4.3 Field Worker
Needs:
Simple upload workflow


Ability to tag tasks performed


Automated documentation


Immediate safety notifications


4.4 Safety Manager
Needs:
OSHA violation tracking


Trend reporting


Incident documentation


4.5 Executive
Needs:
Long-term productivity trends


Risk indicators


Portfolio-level benchmarking



5. Core System Capabilities
The platform consists of three primary engines:
Field Reality Capture


Task Inference Engine


Decision Intelligence Layer



6. Procore Integration Requirements
The system integrates with Procore via API.
6.1 Project Metadata
Pull:
Project ID


Project name


Location


Associated companies


Team assignments


Company directory


Trade classifications


6.2 Schedule Context
Pull short-term schedule intent:
2–6 week lookahead tasks


Task name


Planned start date


Planned end date


Location context


Full CPM schedules are not required.
6.3 Daily Logs
Pull:
Work performed entries


Labor hours


Equipment logs


Safety notes


Purpose:
Prevent duplicate documentation


Validate AI-inferred task completions


Quantify time savings


Synchronization must support:
Secure token-based authentication


Scheduled refresh


Incremental updates



7. User Flows
7.1 Login and Dashboard
Role-based access control.
Upon login:
Project Manager sees:
List of active projects


Yesterday’s execution summary


Safety alerts


Efficiency trend indicators


Selecting a project displays:
Team breakdown


Alignment score


Task completion summary


Safety compliance summary



7.2 Worker Upload Flow
Worker selects:
Project


Date


Tasks performed (from lookahead + subtask list)


Worker uploads:
Raw bodycam footage


Worker tags:
Micro-tasks performed that day


These tags become labeled training data and validation signals.

7.3 Video Review Interface
Layout:
Top Left:
Video player


Bottom:
Timeline with task markers


Highlighted segments for task completions


Safety violation flags


Top Right Controls:
Team selector


Worker selector


Date selector


Below Controls:
Natural language assistant



8. Machine Learning Pipeline
8.1 Input
Raw bodycam video.

8.2 Processing Stages
Stage 1: Frame Extraction
Video segmented into frames.
Stage 2: Object Detection
YOLOv8 fine-tuned on:
Construction object datasets


PPE datasets


Site-specific object classes


Stage 3: Depth Modeling
Depth Anything V2 used to:
Generate depth maps


Enable spatial reasoning


Improve context consistency


Stage 4: Temporal Action Recognition
Sequence modeling to detect:
Task initiation


Task progression


Task completion


Object detection alone is insufficient. Temporal modeling is required.
Stage 5: Event Abstraction
Convert detections into structured events:
Event Structure:
Worker ID


Project ID


Task ID


Start timestamp


End timestamp


Duration


Confidence score


Safety flags



9. Safety Detection Engine
Detect violations aligned with OSHA 29 CFR 1926 standards.
Examples:
Missing hard hat


Lack of fall protection


Unsafe ladder usage


Improper PPE


Requirements:
High precision threshold


Confidence scoring


Real-time alerts


Alert Channels:
SMS


Push notification


Dashboard update


Precision is prioritized over recall to maintain trust.

10. Verbal Task Capture
System captures foreman verbal instructions via:
Audio transcription


Speaker diarization


Task intent extraction


Example:
“Finish tying conduit and move to panel B.”
Extracted Tasks:
Tie conduit


Move to panel B


These micro-task logs:
Improve ground truth labeling


Strengthen task attribution


Enable bottom-up efficiency modeling



11. Data Model Overview
Core Entities:
Project
Project ID


Name


Location


Worker
Worker ID


Trade


Company


Planned Task
Task ID


Planned start/end


Location context


Observed Event
Worker ID


Task ID


Start time


End time


Duration


Confidence


Safety indicator


Daily Summary
Alignment score


Efficiency score


Safety compliance rate



12. Analytics Framework
12.1 Execution Alignment Score
Completed Planned Tasks / Intended Tasks
Measures schedule adherence.

12.2 Task Efficiency
Observed Duration / Expected Duration
Measures performance relative to plan.

12.3 Safety Compliance Rate
Safe Observations / Total Safety Observations

12.4 Daily Win/Loss Indicator
Weighted function of:
Alignment


Efficiency


Safety


This metric must:
Incorporate variance tolerance


Consider external disruptions (weather, inspections, material delays)


Binary output should be derived from probabilistic scoring, not simplistic thresholds.

13. System Architecture
13.1 Identity Layer
Secure authentication


Role-based access control


Project-scoped permissions


13.2 Application Layer
Dashboard services


Upload services


Notification services


Query assistant


13.3 ML Processing Layer
Object detection


Depth modeling


Temporal segmentation


Event abstraction


13.4 Storage Layer
Supabase object storage for raw video


Relational database for structured events


Analytics warehouse for aggregated metrics


13.5 Notification Layer
SMS gateway


Real-time alert engine



14. Non-Functional Requirements
Security:
Encryption at rest


Encryption in transit


Audit logging


Scalability:
Horizontal scaling of processing nodes


Distributed batch inference


Performance:
Sub-minute safety alert latency target


Batch analytics SLA defined per project size


Accuracy Targets:
90% precision for safety detection


Confidence reporting for all inferred tasks



15. Risks and Mitigation
Privacy Risk
Mitigation:
Transparency


Clear data usage policies


Positioning as safety/documentation tool


Model Bias
Mitigation:
Diverse training datasets


Continuous retraining


Confidence-based outputs


False Positives
Mitigation:
Precision prioritization


Manual override capability


Adoption Resistance
Mitigation:
Demonstrate time savings


Integrate seamlessly with existing Procore workflows



16. Success Metrics
Short-Term:
Reduction in manual logging time


Adoption rate by field workers


Daily dashboard usage rate


Mid-Term:
Increased alignment scores


Reduced safety violations


Reduced schedule variance


Long-Term:
Improved productivity trends


Portfolio-level benchmarking adoption




