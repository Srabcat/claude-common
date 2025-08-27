# command: /git-checkpoint $ARGUMENTS

Save and commit Current work to github 

## Run these Steps to save all files to github

```bash
git add .
git commit -m "checkpoint: $ARGUMENTS"
git push origin main
```

## View Checkpoints
```
git log --oneline --grep="checkpoint:"
```

**Progress saved to github. Keep building.**