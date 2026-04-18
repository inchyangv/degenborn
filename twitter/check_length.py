#!/usr/bin/env python3
"""Check all tweets in TWITTER_CONTENT.md for 280-char Twitter limit."""

import re

def twitter_length(text):
    """Approximate Twitter character count.
    URLs (including [LINK] placeholders) count as 23 chars.
    """
    # Replace link placeholders with 23-char stand-ins
    t = text
    for placeholder in ['[DoraHacks submission link]', '[VOTE LINK]', '[APP LINK]', '[LINK]/replay', '[LINK]']:
        t = t.replace(placeholder, 'x' * 23)
    return len(t)

def parse_tweets(filepath):
    with open(filepath, 'r') as f:
        content = f.read()

    # Split by ### headers to get tweet blocks
    blocks = re.split(r'^### (.+)$', content, flags=re.MULTILINE)

    tweets = []
    i = 1
    while i < len(blocks):
        header = blocks[i].strip()
        body = blocks[i + 1] if i + 1 < len(blocks) else ""
        i += 2

        # Remove [IMG: ...] lines and metadata
        lines = body.strip().split('\n')
        tweet_lines = []
        for line in lines:
            if line.startswith('[IMG:'):
                continue
            if line.startswith('[POLL'):
                continue
            if line.startswith('(') and line.endswith(')'):
                continue
            if line.startswith('Thread continues:'):
                continue
            if line.startswith('---'):
                break
            if line.startswith('## '):
                break
            if line.startswith('# '):
                break
            tweet_lines.append(line)

        # Clean trailing empty lines
        while tweet_lines and tweet_lines[-1].strip() == '':
            tweet_lines.pop()
        while tweet_lines and tweet_lines[0].strip() == '':
            tweet_lines.pop(0)

        tweet_text = '\n'.join(tweet_lines)

        if not tweet_text.strip():
            continue

        # Check if it's a thread (has 1/, 2/ pattern)
        if re.search(r'^\d+/', tweet_text, re.MULTILINE):
            # Split into main tweet + thread replies
            # Main tweet is everything before "1/"
            parts = re.split(r'^(\d+/)', tweet_text, flags=re.MULTILINE)

            # First part is the main tweet
            main_tweet = parts[0].strip()
            if main_tweet:
                tweets.append((header + " [MAIN]", main_tweet))

            # Thread parts
            j = 1
            while j < len(parts) - 1:
                num = parts[j]
                text = parts[j + 1] if j + 1 < len(parts) else ""
                # Check if next part is another number or end
                thread_text = (num + text).strip()
                # Clean: remove everything after next thread marker
                tweets.append((header + f" [{num.strip()}]", thread_text))
                j += 2
        else:
            # Check for IF WIN / IF NOT WIN split
            if 'IF WIN:' in tweet_text and 'IF NOT WIN:' in tweet_text:
                win_part = tweet_text.split('IF NOT WIN:')[0].replace('IF WIN:\n', '').strip()
                lose_part = tweet_text.split('IF NOT WIN:')[1].strip()
                tweets.append((header + " [WIN]", win_part))
                tweets.append((header + " [LOSE]", lose_part))
            else:
                tweets.append((header, tweet_text))

    return tweets


def main():
    tweets = parse_tweets('twitter/TWITTER_CONTENT.md')

    over = []
    total = 0
    for header, text in tweets:
        total += 1
        length = twitter_length(text)
        if length > 280:
            over.append((header, length, text))
            print(f"OVER [{length:3d}] {header}")
            print(f"  >>> {text[:100]}...")
            print()

    print(f"{'='*60}")
    print(f"Total tweet blocks checked: {total}")
    print(f"Over 280 chars: {len(over)}")
    print()

    if over:
        print("DETAILED BREAKDOWN:")
        print()
        for header, length, text in over:
            print(f"--- {header} ({length} chars, need to cut {length - 280}) ---")
            print(text)
            print()


if __name__ == "__main__":
    main()
