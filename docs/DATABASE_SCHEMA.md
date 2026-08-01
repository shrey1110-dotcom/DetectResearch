# Database Entity Relationships

```
[University] (1) <---> (N) [Department]
[University] (1) <---> (N) [Professor]
[University] (1) <---> (N) [ResearchItem]

[Professor] (1) <---> (N) [ResearchItem] (via ProfessorResearchLink)
[ResearchItem] (N) <---> (M) [Topic] (via ResearchItemTopic)
```

- Added support for CSULB and UOP in `University` and `Department` models.
