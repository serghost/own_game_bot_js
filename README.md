# Dev plan

1. Each player can push questions to the DB.
2. The player is not allowed to answer own questions.
3. Each question has a vote cast. A vote cast determines if question might be dropped. Suggested formula is:

``` ruby
if negative_votes > players.count * 0.5
  question.drop
end
```

4. Scores for the questions: 100, 300, 500, 1000, 1500
