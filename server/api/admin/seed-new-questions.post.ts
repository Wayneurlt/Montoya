import prisma from '~/lib/prisma'
import { doOrDrinkQuestions } from '~/data/questions/doordrink'

export default defineEventHandler(async () => {
  try {
    console.log('🌱 Starting new database seeding with comfort level approach...')
    
    // User-provided questions organized by game type and intensity
    const mildTruths = [
      "What's the most adventurous thing you've done in a relationship?",
      "Who here do you think is the most confident?",
      "What was your grade in high school soft",
      "Who was your first celebrity crush?",
      "Who here would you most like to be stranded with for 24 hours?",
      "Do you have any secret tattoos or piercings?",
      "Have you ever lied to get out of trouble?",
      "What's your biggest regret?",
      "Have you ever been caught lying?",
      "Have you ever been in love?",
      "Have you ever pretended to be sick to get out of something?",
      "What's your biggest insecurity?",
      "Have you ever lied about your age?",
      "Have you ever stolen something?",
      "What's the most embarrassing thing that's happened to you recently",
      "When was the last time you cried, and why?",
      "What is a secret you've never told anyone?",
      "Have you ever lied to get someone to like you?",
      "What is your biggest turn-on that no one knows about?",
      "Have you ever gone on a date just for the food or drinks?",
      "What is the most awkward romantic encounter you've had?",
      "Who here do you think gives the best hugs?",
      "Have you ever had a dream about someone here?",
      "What's the most you've done on a first date?",
      "Have you ever flirted with someone you shouldn't have?",
      "Have you ever been caught staring at someone?",
      "What is the boldest thing you've done to get someone's attention?",
      "Who here would you call if you needed a 'partner in crime' for something wild?",
      "Have you ever ghosted someone after a date?",
      "Who here do you think has the best smile?",
      "What is the most romantic thing you've done for someone?",
      "Have you ever gone out without underwear?",
      "Have you ever been on more than one date in a single day?",
      "Have you ever made the first move on someone?",
      "What's one secret about your love life you've never admitted to anyone — until now?",
      "Have you ever had feelings for two people at once?",
      "Have you ever flirted just to get something?",
      "What's your biggest dating dealbreaker?",
      "Have you ever kissed someone you weren't supposed to?",
      "Have you ever faked a crush or fake-flirted to make someone jealous?",
      "What song always puts you in the mood?",
      "What unexpected part of the body do you find attractive?"
    ]

    const spicyTruths = [
      "What's the most extreme thing you've done for sexual gratification?",
      "What's your biggest sexual turn-on that might surprise us?",
      "Hot friend. Who's the first person who came to mind?",
      "Who here would you most want to go on a date with?",
      "Confess one sexual desire you're too ashamed to admit normally.",
      "What's the craziest, most depraved thing you'd do for pleasure?",
      "What body part do you secretly find most arousing on anyone?",
      "What's the one sexual act you absolutely refuse to do, and why?",
      "What is the most daring thing you've done while flirting?",
      "Have you ever sent a risky text or photo to the wrong person?",
      "Who was your biggest crush in this room?",
      "What's the dirtiest thing you've ever done for money or power?",
      "What's the most unusual place you've climaxed unexpectedly?",
      "Have you ever had a sex dream about someone here?",
      "What is the wildest place you've ever kissed someone?",
      "Who here do you think is the best kisser?",
      "Do you still have feelings for any of your exes?",
      "Have you ever had sex with more than one date in a single day/night?",
      "Who here do you think is the most confident lover?",
      "Who's one person you would kiss right now — no hesitation?",
      "Have you ever made out or hooked up somewhere you definitely shouldn't have?",
      "What's the riskiest text you've ever sent?",
      "Have you ever flirted with a close friend's sibling?",
      "If you had to kiss someone in this room, who would it be?",
      "Would you ever date a friend's ex if they gave you permission?",
      "What sexual secret would absolutely shock your closest friends?",
      "What part of your body is most sensitive to a deep, slow lick?",
      "Have you ever faked an orgasm? When and why, truthfully?"
    ]

    const superSpicyTruths = [
      "What's the wildest place you've ever had sex or been pleasured?",
      "Describe your ultimate sexual power fantasy, in full detail.",
      "Have you ever hooked up with someone completely inappropriate? Who?",
      "What is your biggest sexual guilty pleasure?",
      "Who here do you think gives the best head?",
      "Show us the riskiest text you've ever sent?",
      "Who in this room would you call for a \"no-questions-asked\" hookup?",
      "What's your wildest fantasy?",
      "What's the kinkiest thing you've secretly fantasized about doing tonight?",
      "Describe your most scandalous public sexual encounter, omitting no detail.",
      "What's the naughtiest thing you've done in a bathroom stall?",
      "Confess one secret sexual act you've performed that nobody knows.",
      "Who in this room, if anyone, do you secretly want to fuck?",
      "What's the dirtiest fantasy you've actually brought to life?",
      "What's the most humiliating (in a good way) sexual experience?",
      "What's the most number of people you've been sexual with at once?",
      "What's the riskiest sexual thing you've done and got away with?",
      "What's the most amount of orgasms you've had in one session?",
      "Who's the person you secretly want to dominate or be dominated by?",
      "What's your deepest, darkest sexual secret you've never shared?",
      "Describe the sexiest, most primal moan you've ever let out.",
      "Describe your most intense, mind-blowing, full-body orgasm.",
      "What's the most taboo sexual act you'd be willing to try once?",
      "When was the last time you masturbated, and what did you imagine?",
      "What's the most non-consensual (in a fantasy way) act you crave?",
      "What's the most forbidden thought you've had during sex?",
      "What's the raunchiest thing you've ever said during sex?",
      "Describe your most intense sexual encounter involving multiple partners."
    ]

    const mildDares = [
      "Hold hands with the person on your left for one full minute.",
      "jump into a swimming pool.",
      "Whisper something mysterious into the ear of the person across from you.",
      "Compliment someone here in the most charming way you can.",
      "Let the person on your right pick a funny pick-up line for you to say to someone.",
      "Take a selfie with the person you think has the best style here.",
      "Give someone a dramatic movie-style hug.",
      "Let someone in the group redo your hairstyle.",
      "Act out a dramatic romantic scene from a movie.",
      "Pretend you're on a dating show and introduce yourself in 10 seconds.",
      "Let someone choose a fun nickname for you to use for the rest of the game.",
      "Hold someone's hand and tell them one nice thing about them.",
      "Give your phone to someone and let them choose your profile picture for the next hour.",
      "Pretend to serenade someone with an imaginary guitar.",
      "Write a silly but sweet note to someone here.",
      "Draw a quick doodle of the person to your right and show it to everyone.",
      "Lick a bar of soap.",
      "Talk to a pillow as if it's your crush.",
      "Describe the most attractive quality of every person in the room.",
      "Jump in the pool (or shower) with all your clothes on!",
      "Sing a love song to the person next to you.",
      "Do your best slow dance with an imaginary partner.",
      "Pretend to propose to someone in the room.",
      "Send a flirty emoji to the third person in your messages list.",
      "Send a 'thinking of you' text to someone outside the game.",
      "Draw a heart on your hand and show it to the person you like most here.",
      "Give your best model walk around the room.",
      "Make eye contact with someone here for 15 seconds without laughing.",
      "Pretend to be hopelessly in love with the person across from you.",
      "Let someone take a silly but cute picture of you.",
      "Do your best impression of someone flirting.",
      "Let someone in the group take a short video of you doing a dramatic hair flip.",
      "Pretend you just bumped into your crush at a coffee shop — act it out.",
      "Send a random heart emoji to the last person you texted.",
      "Give your best compliment to the person on your left while looking them in the eyes.",
      "Make out with a pillow.",
      "Tell the group your 'type' without using any words.",
      "Send your mom or dad a text that just says, 'We need to talk.'",
      "Describe three turns-ons you have that you've never told anyone."
    ]

    const spicyDares = [
      "Lick syrup off your partner's chest, taking your time and making eye contact.",
      "Blindfold yourself and let a player touch you anywhere for one minute.",
      "Rub ice cubes over your nipples and groin until they are hard and throbbing.",
      "Moan out loud while imagining your ultimate sexual fantasy, detail the climax.",
      "Dirty talk for one full minute, describing exactly what you want to do tonight.",
      "Roleplay your naughtiest fantasy with a player, complete with graphic dialogue.",
      "Put on a condom with your mouth only, then put it on a partner's finger.",
      "Give a passionate, open-mouthed kiss to every player in the room.",
      "Dance seductively for two minutes, climaxing with a simulated orgasm.",
      "Take a shot off someone's bare belly, making it sensual and drawn out.",
      "Let another player write a dirty word anywhere on your body with lipstick.",
      "Demonstrate how you would seduce someone using only your body and eyes.",
      "Let a player tickle you sensually anywhere they choose for one minute.",
      "Allow a player to blindfold you and feed you a piece of fruit provocatively.",
      "Act out a specific sex position you've always wanted to try with a partner.",
      "Blindfold a player and caress their body, guessing what you are touching."
    ]

    const superSpicyDares = [
      "Give a graphic, explicit lap dance to someone of your choice, grinding intensely.",
      "Simulate oral sex on a banana or cucumber for 60 seconds, with sound effects.",
      "Strip down to nothing while narrating every garment removed and your arousal.",
      "Let a partner lick whipped cream off your private parts, slowly and thoroughly.",
      "Describe the last time you masturbated, including every detail and your climax.",
      "Simulate sex on the floor, getting very graphic, for 30 seconds.",
      "French kiss a player for a full minute, with maximum tongue contact.",
      "Remove an article of clothing using only your teeth, slowly and suggestively.",
      "Whisper your most forbidden sexual desire into a player's ear, very explicitly.",
      "Lick a line of body shots off another player's inner thigh.",
      "Grind on a player from behind until you both feel immense arousal.",
      "Let a player pour a drink over your body and lick it off wherever they choose.",
      "Show your sexiest dance moves, focusing on hip thrusts and body rolls.",
      "Simulate giving head to a bottle, getting incredibly explicit and detailed.",
      "Let a player spank your bare bottom five times, hard.",
      "Describe your ultimate sexual fantasy in graphic detail to the group.",
      "Give a sensuous foot massage to a player using your mouth and tongue.",
      "Eat a piece of fruit suggestively, letting the juice dribble down your chin.",
      "Remove your bra/shirt and let another player draw on your nipples with a marker.",
      "Grind on a pillow like it's your lover, reaching a simulated orgasm.",
      "Perform a sensual full-body dry-hump on a player for 30 seconds.",
      "Let another player apply body oil to your chest and stomach provocatively.",
      "Describe your sexiest dream in full, explicit detail to the group."
    ]

    const mildNeverHaveIEver = [
      "Never have I ever been fired.",
      "Never have I ever been expelled.",
      "Never have I ever had a negative bank account balance.",
      "Never have I ever had a relationship last less than a month.",
      "Never have I ever fallen in love at first sight.",
      "Never have I ever had sex in public.",
      "Never have I ever been set up on a date.",
      "Never have I ever creeped an ex on social media.",
      "Never have I ever ghosted someone.",
      "Never have I ever slid into someone's DMs.",
      "Never have I ever had a crush on a teacher.",
      "Never have I ever snooped through someone's phone.",
      "Never have I ever told someone 'I love you' without meaning it.",
      "Never have I ever been called a player.",
      "Never have I ever used a dating app.",
      "Never have I ever cheated on someone.",
      "Never have I ever been cheated on.",
      "Never have I ever catfished someone.",
      "Never have I ever been caught lying.",
      "Never have I ever dated someone older than me.",
      "Never have I stood a date up.",
      "Never have I ever lied to someone in this room.",
      "Never have I ever intentionally started a fight between other people.",
      "Never have I ever found a dumb excuse to text an ex.",
      "Never have I ever found a dumb excuse to break up with an ex."
    ]

    const spicyNeverHaveIEver = [
      "Never have I ever been caught masturbating.",
      "Never have I ever had a threesome.",
      "Never have I ever hooked up with a stranger on the same day I met them.",
      "Never have I ever sent nudes to someone.",
      "Never have I ever had phone sex or video sex.",
      "Never have I ever been to a sex club or swingers party.",
      "Never have I ever been blindfolded during sex.",
      "Never have I ever done roleplay in bed.",
      "Never have I ever had sex outdoors.",
      "Never have I ever been walked in on during sex.",
      "Never have I ever joined the mile-high club.",
      "Never have I ever hooked up with a coworker.",
      "Never have I ever been with someone at least 10 years older.",
      "Never have I ever taken a sexy video of myself.",
      "Never have I ever been skinny-dipping while aroused.",
      "Never have I ever done something sexual in a car.",
      "Never have I ever had a one-night stand.",
      "Never have I ever been touched under the table in public.",
      "Never have I ever sexted while in a relationship with someone else.",
      "Never have I ever tried BDSM or something kinky.",
      "Never have I ever kissed my best friend.",
      "Never have I ever kissed a friend's ex.",
      "Never have I ever given a lap dance.",
      "Never have I ever kissed more than one person in the same night.",
      "Never have I ever flirted just to get something I wanted."
    ]

    const superSpicyNeverHaveIEver = [
      "Never have I ever had sex with more than one person in 24 hours.",
      "Never have I ever been tied up or tied someone up in bed.",
      "Never have I ever used a sex toy on someone else.",
      "Never have I ever let someone watch me have sex.",
      "Never have I ever tasted myself or my partner after sex.",
      "Never have I ever been spanked during sex.",
      "Never have I ever licked food or whipped cream off someone.",
      "Never have I ever had shower sex."
    ]

    const mildMostLikelyTo = [
      "Who is most likely to cheat on a test?",
      "Who is most likely to lie to a parent?",
      "Who is most likely to give someone the wrong directions (intentionally)?",
      "Who is most likely to fake a compliment?",
      "Who is most likely to be on the news for being involved with a scam?",
      "Who is most likely to go a week without a shower?",
      "Who is most likely to sneak out at night?",
      "Who is most likely to start a rumor?",
      "Who is most likely to have a crush on a teacher or boss?",
      "Who is most likely to get caught sneaking out after curfew?",
      "Who is most likely to fart in a full elevator?",
      "Who is most likely to post a thirst trap?",
      "Who is most likely to get matching tattoos with someone they just met?",
      "Who is most likely to end up in a love triangle?",
      "Who is most likely to go speed dating?",
      "Who is most likely to fall for someone they met online?",
      "Who is most likely to get caught lying about where they were?",
      "Who is most likely to spill a secret during a game of Never Have I Ever?",
      "Who is most likely to start drama in a group chat?",
      "Who is most likely to plan a secret date?",
      "Who is most likely to send nudes to the wrong person?",
      "Who is most likely to hook up with a stranger they just met?",
      "Who is most likely to have a one-night stand on vacation?",
      "Who is most likely to send a dirty text to the wrong chat?",
      "Who is most likely to have a wild story they can't share?",
      "Who is most likely to hook up with a co-worker?",
      "Who is most likely to pee in the shower?",
      "Who is most likely to get arrested?",
      "Who is most likely to die poor?",
      "Who is most likely to date more than one person at a time?",
      "Who is most likely to kiss and tell?",
      "Who is most likely to initiate a breakup?",
      "Who is most likely to regularly check an ex's Instagram?",
      "Who is most likely to wake up in someone else's bed without remembering how they got there?",
      "Who is most likely to try skinny dipping?",
      "Who is most likely to get back with a toxic ex?",
      "Who is most likely to text their ex after a night out?",
      "Who is most likely to send a flirty DM to a celebrity?",
      "Who is most likely to be the first to suggest playing strip poker?",
      "Who is most likely to flirt their way out of trouble?",
      "Who is most likely to befriend their one-night stand?",
      "Who is most likely to hook up at a wedding?",
      "Who is most likely to be dared into kissing a stranger?",
      "Who is most likely to send flowers to a hookup?",
      "Who is most likely to be caught making out at work?",
      "Who is most likely to date someone just for the thrill?",
      "Who is most likely to hook up with someone they swore they never would?",
      "Who is most likely to confess feelings at the worst possible moment?",
      "Who is most likely to be caught sneaking someone into their room?",
      "Who is most likely to brag about something that didn't happen?",
      "Who is most likely to disappear after a night out?",
      "Who is most likely to accidentally send a voice note they regret?",
      "Who is most likely to get caught sending risky texts?",
      "Who is most likely to hook up with someone out of boredom?",
      "Who is most likely to get drunk and call their ex?",
      "Who is most likely to flirt with someone taken?",
      "Who is most likely to hook up with someone at a festival?",
      "Who is most likely to start dating someone just for clout?"
    ]

    const spicyMostLikelyTo = [
      "Who is most likely to sleep with their ex?",
      "Who is most likely to have a secret friends-with-benefits situation?",
      "Who is most likely to hook up in a public place?",
      "Who is most likely to flirt with a friend's partner?",
      "Who is most likely to sext someone while in the same room?",
      "Who is most likely to be caught watching adult content?",
      "Who is most likely to go commando to a party?",
      "Who is most likely to kiss more than one person in the same night?",
      "Who is most likely to roleplay in bed?",
      "Who is most likely to try something kinky without telling their partner first?",
      "Who is most likely to sleep over after a one-night stand?",
      "Who is most likely to be tied up during sex?",
      "Who is most likely to sneak away during an event for a quickie?",
      "Who is most likely to hook up with someone significantly older?",
      "Who is most likely to make out with a stranger in a club?",
      "Who is most likely to experiment with the same gender?",
      "Who is most likely to have a secret kink?",
      "Who is most likely to get drunk and say something filthy?",
      "Who is most likely to sleep with a celebrity if given the chance?",
      "Who is most likely to have a spicy dream about someone here?",
      "Who is most likely to laugh during a serious hookup moment?",
      "Who is most likely to hook up with a friend's sibling?",
      "Who is most likely to ghost someone after sleeping with them?",
      "Who is most likely to say the wrong name in bed?",
      "Who is most likely to be caught having sex at work?",
      "Who is most likely to fall asleep during a hookup?",
      "Who is most likely to kiss someone during truth or dare?",
      "Who is most likely to accidentally post something NSFW?",
      "Who is most likely to hook up with a neighbor?",
      "Who is most likely to forget their hookup's name?",
      "Who is most likely to play matchmaker but secretly want the person?",
      "Who is most likely to overshare a hookup story?",
      "Who is most likely to break the 'no dating in the group' rule?"
    ]

    const superSpicyMostLikelyTo = [
      "Who is most likely to make a sex tape?",
      "Who is most likely to have had sex in a car?",
      "Who is most likely to send a naughty selfie at work?",
      "Who is most likely to hook up in an elevator?",
      "Who is most likely to own the most sex toys?",
      "Who is most likely to date their best friend's ex?"
    ]

    const wouldYouRatherQuestions = [
      "Would you rather have a one-night stand with your biggest crush or your biggest enemy?",
      "Would you rather be caught in the act by your best friend or by a stranger?",
      "Would you rather send a spicy photo to the wrong person or have your search history exposed?",
      "Would you rather have passionate car sex or risky public bathroom sex?",
      "Would you rather be the submissive or the dominant in bed for a whole week?",
      "Would you rather have a threesome with strangers or roleplay with your partner in disguise?",
      "Would you rather have your partner read your deepest fantasies aloud or act them out without warning?",
      "Would you rather be tied up or do the tying?",
      "Would you rather have sex on the beach or in the back of a moving car?",
      "Would you rather have your partner whisper dirty things in public or send them in a text at work?",
      "Would you rather hook up with someone 10 years older or 10 years younger?",
      "Would you rather be watched during sex or secretly watch others?",
      "Would you rather try a full body massage with a happy ending or be blindfolded for the entire session?",
      "Would you rather do a striptease for someone or have someone do it for you?",
      "Would you rather be kissed slowly for an hour or be teased with touches for an hour?",
      "Would you rather moan your partner's name loudly or whisper it seductively?",
      "Would you rather skinny dip at night or sunbathe nude during the day?",
      "Would you rather have morning sex every day or late-night sex every night?",
      "Would you rather be completely silent during sex or be told to talk dirty the whole time?",
      "Would you rather be spanked or do the spanking?",
      "Would you rather try ice play or wax play?",
      "Would you rather taste whipped cream off someone or chocolate syrup?",
      "Would you rather film a private video or take erotic photos?",
      "Would you rather be teased for hours without release or have a quick, intense session?",
      "Would you rather make out in an elevator or in a movie theater?",
      "Would you rather sext for an entire day or go without touching each other for a week?",
      "Would you rather hook up in a swimming pool or a rooftop?",
      "Would you rather wear lingerie for an entire day or have your partner wear something for you?",
      "Would you rather be woken up by sex or fall asleep during it?",
      "Would you rather explore a kink you've never tried or revisit your favorite one with extra intensity?",
      "Would you rather be the one who initiates sex or the one who waits for the other to make the first move?",
      "Would you rather spoon while in the nude or in cozy pajamas?",
      "Would you rather be a great kisser or great in bed?",
      "Would you rather have sex in front of a fireplace OR by the light of 100 candles?",
      "Would you rather make out in the last row of a movie theater OR the back of a taxi?",
      "Would you rather have a partner leave you sexy notes to find around the house or send you sexy texts throughout the day?",
      "Would you rather have sex in a school classroom or under the bleachers at a sporting event?",
      "Would you rather wear sexy lingerie under your clothes or no underwear at all on a date night?",
      "Would you rather make out with someone on and off for hours or share one 5-minute long steamy kiss?",
      "Would you rather never cuddle again or never hold hands again?",
      "Would you rather accidentally say 'I love you' during sex or fart during sex?",
      "Would you rather accidentally post a nude on your Instagram story or accidentally text a nude to your grandparents?",
      "Would you rather play Spin the Bottle or Strip Poker?",
      "Would you rather always finish in one minute or never be able to finish?",
      "Would you rather listen to your neighbors having sex or have your neighbors listen to you have sex?",
      "Would you rather have a superpower to be able to hear other people's dirty thoughts or be able to see through people's clothes?",
      "Would you rather try a new position every time you have sex or only ever have missionary sex?",
      "Would you rather hook up in absolute silence or hook up with the same song playing on repeat?",
      "Would you rather only be able to have quickie sex or only be able to have sex with an hour of foreplay?",
      "Would you rather have a threesome with your partner and a celebrity crush, or hook up with your celebrity crush as your partner watches?",
      "Would you rather have your toes sucked or try to stimulate a partner with your feet?",
      "Would you rather have sex on a forest floor crawling with bugs or on top of a building in the middle of a thunderstorm?",
      "Would you rather show your porn search history to your best friend or your partner?",
      "Would you rather have sex with a bag over your head or have sex with a bag over an anonymous partner's head?",
      "Would you rather have a photo of your naked body displayed in an art gallery or have a vivid description of your wildest sexual fantasy published in a magazine?",
      "Would you rather wear a remote-controlled vibrator to a business meeting or on a first date with your crush?",
      "Would you rather swear off sex entirely or only have sex during orgies for the rest of your life?",
      "Would you rather only be able to have standing sex or only be able to have sex in missionary position?",
      "Would you rather wait a week for your partner's parents to leave or sneak in quickies while they're asleep?",
      "Would you rather swap partners with a friend and their partner, or complete strangers?",
      "Would you rather be blindfolded OR gagged?",
      "Would you rather only have 'vanilla' sex, OR only have 'BDSM' sex?",
      "Would you rather always have sex in the dark OR always have sex with the lights on?",
      "Would you rather be silenced with a gag ball OR spanked with a paddle?",
      "Would you rather have sex while blindfolded OR handcuffed?",
      "Would you rather have to be on top for the rest of your life OR on bottom for the rest of your life?",
      "Would you rather have sex with a goat and no one finds out OR not have sex with a goat but everyone thinks you did?",
      "Would you rather sneeze OR fart every time you orgasm?",
      "Would you rather never have an orgasm OR never find true love?",
      "Would you rather have drunk sex OR high sex?",
      "Would you rather give up penetrative sex OR oral sex?",
      "Would you rather give up sex for the rest of your life OR chocolate for the rest of your life?",
      "Would you rather be caught cheating or catch your partner cheating?",
      "Would you rather only be able to have sex in the shower, or only be able to have sex on the floor?",
      "Would you rather your parents walked in on you, or you walked in on them?",
      "Would you rather be with someone who never showers or someone who never brushes their teeth?",
      "Would you rather dirty talk all the time or never be able to talk during sex?",
      "Would you rather your nudes leaked to your family or to your coworkers?",
      "Would you rather sext every day for a year, or never sext again?",
      "Would you rather be too loud in bed or completely silent?",
      "Would you rather have your boss catch you sexting or your parents?",
      "Would you rather be known as bad in bed but great at kissing, or the other way around?",
      "Would you rather never be able to kiss again or never be able to cuddle again?",
      "Would you rather get a hickey or give a hickey?",
      "Would you rather send nudes or receive them?",
      "Would you rather have drunk sex you don't remember or sober sex that's awkward?",
      "Would you rather have a partner who's kinky but selfish, or vanilla but generous?",
      "Would you rather hook up with your ex or your ex's best friend?",
      "Would you rather your search history be leaked or your photo gallery?",
      "Would you rather be famous for a leaked tape or never be famous at all?"
    ]

    // Prepare game cards (Truth or Dare and Do or Drink)
    const gameCards: Array<{
      type: 'TRUTH' | 'DARE' | 'DO'
      gameType: 'TRUTH_OR_DARE' | 'DO_OR_DRINK'
      text: string
      intensity: number
      drinkAmount?: string | null
    }> = []

    // Truth questions: MILD = 2, SPICY = 4, S.SPICY = 5
    for (const text of mildTruths) {
      gameCards.push({ type: 'TRUTH', gameType: 'TRUTH_OR_DARE', text: text.trim(), intensity: 2 })
    }
    for (const text of spicyTruths) {
      gameCards.push({ type: 'TRUTH', gameType: 'TRUTH_OR_DARE', text: text.trim(), intensity: 4 })
    }
    for (const text of superSpicyTruths) {
      gameCards.push({ type: 'TRUTH', gameType: 'TRUTH_OR_DARE', text: text.trim(), intensity: 5 })
    }

    // Dare questions: MILD = 2, SPICY = 4, S.SPICY = 5
    for (const text of mildDares) {
      gameCards.push({ type: 'DARE', gameType: 'TRUTH_OR_DARE', text: text.trim(), intensity: 2 })
    }
    for (const text of spicyDares) {
      gameCards.push({ type: 'DARE', gameType: 'TRUTH_OR_DARE', text: text.trim(), intensity: 4 })
    }
    for (const text of superSpicyDares) {
      gameCards.push({ type: 'DARE', gameType: 'TRUTH_OR_DARE', text: text.trim(), intensity: 5 })
    }

    // Do or Drink questions (keep existing ones, assign intensity 2-3)
    for (const text of doOrDrinkQuestions) {
      gameCards.push({ type: 'DO', gameType: 'DO_OR_DRINK', text: text.trim(), intensity: 3, drinkAmount: '2 sips' })
    }

    // Prepare group game questions
    const groupQuestions: Array<{
      gameType: 'NEVER_HAVE_I_EVER' | 'MOST_LIKELY_TO' | 'WOULD_YOU_RATHER'
      text: string
      intensity: number
      isActive: boolean
    }> = []

    // Never Have I Ever: MILD = 2, SPICY = 4, S.SPICY = 5
    for (const text of mildNeverHaveIEver) {
      groupQuestions.push({ gameType: 'NEVER_HAVE_I_EVER', text: text.trim(), intensity: 2, isActive: true })
    }
    for (const text of spicyNeverHaveIEver) {
      groupQuestions.push({ gameType: 'NEVER_HAVE_I_EVER', text: text.trim(), intensity: 4, isActive: true })
    }
    for (const text of superSpicyNeverHaveIEver) {
      groupQuestions.push({ gameType: 'NEVER_HAVE_I_EVER', text: text.trim(), intensity: 5, isActive: true })
    }

    // Most Likely To: MILD = 2, SPICY = 4, SUPER SPICY = 5
    for (const text of mildMostLikelyTo) {
      groupQuestions.push({ gameType: 'MOST_LIKELY_TO', text: text.trim(), intensity: 2, isActive: true })
    }
    for (const text of spicyMostLikelyTo) {
      groupQuestions.push({ gameType: 'MOST_LIKELY_TO', text: text.trim(), intensity: 4, isActive: true })
    }
    for (const text of superSpicyMostLikelyTo) {
      groupQuestions.push({ gameType: 'MOST_LIKELY_TO', text: text.trim(), intensity: 5, isActive: true })
    }

    // Would You Rather: All seem spicy/wild, assign intensity 4-5
    for (const text of wouldYouRatherQuestions) {
      groupQuestions.push({ gameType: 'WOULD_YOU_RATHER', text: text.trim(), intensity: 4, isActive: true })
    }

    console.log(`📊 Prepared ${groupQuestions.length} group questions and ${gameCards.length} game cards`)

    let groupInserted = 0
    let cardsInserted = 0

    if (groupQuestions.length > 0) {
      console.log('📝 Inserting group questions...')
      const groupResult = await prisma.groupGameQuestion.createMany({
        data: groupQuestions.map((q) => ({
          gameType: q.gameType as any,
          text: q.text.trim(),
          intensity: q.intensity,
          isActive: q.isActive,
        })),
        skipDuplicates: true,
      })
      groupInserted = groupResult.count
      console.log(`✅ Inserted ${groupInserted} group questions`)
    }

    if (gameCards.length > 0) {
      console.log('📝 Inserting game cards...')
      const cardsResult = await prisma.gameCard.createMany({
        data: gameCards.map((c) => ({
          type: c.type as any,
          gameType: c.gameType as any,
          text: c.text.trim(),
          intensity: c.intensity,
          drinkAmount: c.drinkAmount ?? null,
        })),
        skipDuplicates: true,
      })
      cardsInserted = cardsResult.count
      console.log(`✅ Inserted ${cardsInserted} game cards`)
    }

    return {
      success: true,
      groupQuestionsInserted: groupInserted,
      gameCardsInserted: cardsInserted,
      total: groupInserted + cardsInserted,
      message: `Successfully seeded ${groupInserted + cardsInserted} questions with comfort level mapping`
    }
  } catch (error) {
    console.error('❌ Seeding failed:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to seed database'
    })
  }
})

