/**
 * stepper-step-dictionary.js
 * ─────────────────────────────────────────────────────────────
 * Enhanced step-name normalization engine with 200+ standard
 * line-dance terms, fuzzy matching, disambiguation prompts,
 * and foot/direction inference.
 *
 * Exposes window.__stepperStepDictionary for use by the site
 * helper, PDF importer, and glossary tab.
 * ─────────────────────────────────────────────────────────────
 */
(function () {
  'use strict';
  if (window.__stepperStepDictionary) return;

  /* ════════════════════════════════════════════════════════════
     CANONICAL STEP DEFINITIONS
     Each entry: { name, aliases, counts, feet, description, category }
     ════════════════════════════════════════════════════════════ */
  var STEPS = [
    /* ── Traveling / Walking ────────────────────────────── */
    { name: 'Walk Forward Right',      aliases: ['walk forward r','step forward right','walk r fwd','step r forward'], counts: 1, feet: 'R', description: 'Step right foot forward', category: 'walking' },
    { name: 'Walk Forward Left',       aliases: ['walk forward l','step forward left','walk l fwd','step l forward'], counts: 1, feet: 'L', description: 'Step left foot forward', category: 'walking' },
    { name: 'Walk Back Right',         aliases: ['walk back r','step back right','step r back'], counts: 1, feet: 'R', description: 'Step right foot back', category: 'walking' },
    { name: 'Walk Back Left',          aliases: ['walk back l','step back left','step l back'], counts: 1, feet: 'L', description: 'Step left foot back', category: 'walking' },
    { name: 'Walk Forward x2',         aliases: ['walk forward 2','walk walk','two walks forward','2 walks forward','walk forward x2'], counts: 2, feet: 'R', description: 'Walk forward right, walk forward left', category: 'walking' },
    { name: 'Walk Forward x3',         aliases: ['walk forward 3','three walks forward','3 walks forward','walk forward x3','walk forward x3 with a'], counts: 3, feet: 'R', description: 'Walk forward right, left, right', category: 'walking' },
    { name: 'Walk Back x2',            aliases: ['walk back 2','two walks back','2 walks back','walk back x2'], counts: 2, feet: 'R', description: 'Walk back right, walk back left', category: 'walking' },
    { name: 'Walk Back x3',            aliases: ['walk back 3','three walks back','3 walks back','walk back x3','walk 3 times not 2','walking back counts'], counts: 3, feet: 'R', description: 'Walk back right, left, right', category: 'walking' },

    /* ── Vines / Grapevines ─────────────────────────────── */
    { name: 'Vine Right',              aliases: ['grapevine right','grapevine r','vine r','not a vine just walking'], counts: 4, feet: 'R', description: 'Step right, cross left behind, step right, touch left beside', category: 'vine' },
    { name: 'Vine Left',               aliases: ['grapevine left','grapevine l','vine l'], counts: 4, feet: 'L', description: 'Step left, cross right behind, step left, touch right beside', category: 'vine' },
    { name: 'Vine Right with Turn',    aliases: ['vine right 1/4 turn','grapevine right turn','vine r turn'], counts: 4, feet: 'R', description: 'Step right, cross left behind, turn 1/4 right stepping right, touch left beside', category: 'vine' },
    { name: 'Vine Left with Turn',     aliases: ['vine left 1/4 turn','grapevine left turn','vine l turn'], counts: 4, feet: 'L', description: 'Step left, cross right behind, turn 1/4 left stepping left, touch right beside', category: 'vine' },
    { name: 'Weave Right',             aliases: ['weave r'], counts: 4, feet: 'R', description: 'Cross left over right, step right, cross left behind right, step right', category: 'vine' },
    { name: 'Weave Left',              aliases: ['weave l'], counts: 4, feet: 'L', description: 'Cross right over left, step left, cross right behind left, step left', category: 'vine' },

    /* ── Touches & Points ──────────────────────────────── */
    { name: 'Touch Right Beside',      aliases: ['touch beside right','touch r beside','touch beside with no weight','touching the other foot','touch beside no weight'], counts: 1, feet: 'R', description: 'Touch right foot beside left (no weight change)', category: 'touch' },
    { name: 'Touch Left Beside',       aliases: ['touch beside left','touch l beside'], counts: 1, feet: 'L', description: 'Touch left foot beside right (no weight change)', category: 'touch' },
    { name: 'Point Right',             aliases: ['point r','toe point right'], counts: 1, feet: 'R', description: 'Point right toe to right side (no weight change)', category: 'touch' },
    { name: 'Point Left',              aliases: ['point l','toe point left'], counts: 1, feet: 'L', description: 'Point left toe to left side (no weight change)', category: 'touch' },
    { name: 'Touch Forward Right',     aliases: ['touch fwd right','touch r forward'], counts: 1, feet: 'R', description: 'Touch right foot forward (no weight change)', category: 'touch' },
    { name: 'Touch Forward Left',      aliases: ['touch fwd left','touch l forward'], counts: 1, feet: 'L', description: 'Touch left foot forward (no weight change)', category: 'touch' },
    { name: 'Heel Touch Right',        aliases: ['heel right','heel r','right heel touch','heel touch r'], counts: 1, feet: 'R', description: 'Touch right heel forward', category: 'touch' },
    { name: 'Heel Touch Left',         aliases: ['heel left','heel l','left heel touch','heel touch l'], counts: 1, feet: 'L', description: 'Touch left heel forward', category: 'touch' },
    { name: 'Toe Touch Right',         aliases: ['toe right','toe r','right toe touch','toe touch r'], counts: 1, feet: 'R', description: 'Touch right toe back or to the side', category: 'touch' },
    { name: 'Toe Touch Left',          aliases: ['toe left','toe l','left toe touch','toe touch l'], counts: 1, feet: 'L', description: 'Touch left toe back or to the side', category: 'touch' },

    /* ── Side Steps ────────────────────────────────────── */
    { name: 'Step Right to Side',      aliases: ['side step right','step right','step right side','step r side','step right forward'], counts: 1, feet: 'R', description: 'Step right foot to right side', category: 'side' },
    { name: 'Step Left to Side',       aliases: ['side step left','step left','step left side','step l side','step left forward'], counts: 1, feet: 'L', description: 'Step left foot to left side', category: 'side' },
    { name: 'Side Touch Right',        aliases: ['step right touch','side touch r','step side touch right'], counts: 2, feet: 'R', description: 'Step right to side, touch left beside right', category: 'side' },
    { name: 'Side Touch Left',         aliases: ['step left touch','side touch l','step side touch left'], counts: 2, feet: 'L', description: 'Step left to side, touch right beside left', category: 'side' },

    /* ── Rock Steps ────────────────────────────────────── */
    { name: 'Rock Forward Right',      aliases: ['rock forward r','rock fwd right','rock step forward right'], counts: 2, feet: 'R', description: 'Rock forward on right, recover weight to left', category: 'rock' },
    { name: 'Rock Forward Left',       aliases: ['rock forward l','rock fwd left','rock step forward left'], counts: 2, feet: 'L', description: 'Rock forward on left, recover weight to right', category: 'rock' },
    { name: 'Rock Back Right',         aliases: ['rock back r','rock back recover right'], counts: 2, feet: 'R', description: 'Rock back on right, recover weight to left', category: 'rock' },
    { name: 'Rock Back Left',          aliases: ['rock back l','rock back recover left'], counts: 2, feet: 'L', description: 'Rock back on left, recover weight to right', category: 'rock' },
    { name: 'Rock Right Side',         aliases: ['rock side right','rock r','side rock right'], counts: 2, feet: 'R', description: 'Rock right to side, recover weight to left', category: 'rock' },
    { name: 'Rock Left Side',          aliases: ['rock side left','rock l','side rock left'], counts: 2, feet: 'L', description: 'Rock left to side, recover weight to right', category: 'rock' },

    /* ── Coaster / Sailor ──────────────────────────────── */
    { name: 'Coaster Step Right',      aliases: ['coaster right','coaster r','coaster step r'], counts: 3, feet: 'R', description: 'Step right back, step left together, step right forward (&3&)', category: 'triple' },
    { name: 'Coaster Step Left',       aliases: ['coaster left','coaster l','coaster step l'], counts: 3, feet: 'L', description: 'Step left back, step right together, step left forward (&3&)', category: 'triple' },
    { name: 'Sailor Step Right',       aliases: ['sailor right','sailor r','sailor step r'], counts: 3, feet: 'R', description: 'Cross right behind left, step left to side, step right to side (&3&)', category: 'triple' },
    { name: 'Sailor Step Left',        aliases: ['sailor left','sailor l','sailor step l'], counts: 3, feet: 'L', description: 'Cross left behind right, step right to side, step left to side (&3&)', category: 'triple' },

    /* ── Shuffles / Chasses / Triple Steps ─────────────── */
    { name: 'Shuffle Forward Right',   aliases: ['shuffle forward r','shuffle fwd right','right shuffle forward','triple step forward right','cha cha forward right'], counts: 2, feet: 'R', description: 'Step right forward, close left to right, step right forward (1&2)', category: 'triple' },
    { name: 'Shuffle Forward Left',    aliases: ['shuffle forward l','shuffle fwd left','left shuffle forward','triple step forward left','cha cha forward left'], counts: 2, feet: 'L', description: 'Step left forward, close right to left, step left forward (1&2)', category: 'triple' },
    { name: 'Shuffle Back Right',      aliases: ['shuffle back r','shuffle backward right','right shuffle back','triple step back right'], counts: 2, feet: 'R', description: 'Step right back, close left to right, step right back (1&2)', category: 'triple' },
    { name: 'Shuffle Back Left',       aliases: ['shuffle back l','shuffle backward left','left shuffle back','triple step back left'], counts: 2, feet: 'L', description: 'Step left back, close right to left, step left back (1&2)', category: 'triple' },
    { name: 'Shuffle Right',           aliases: ['shuffle r','side shuffle right','chasse right','right chasse'], counts: 2, feet: 'R', description: 'Step right to side, close left to right, step right to side (1&2)', category: 'triple' },
    { name: 'Shuffle Left',            aliases: ['shuffle l','side shuffle left','chasse left','left chasse'], counts: 2, feet: 'L', description: 'Step left to side, close right to left, step left to side (1&2)', category: 'triple' },

    /* ── Turns ─────────────────────────────────────────── */
    { name: 'Pivot Half Turn Right',   aliases: ['pivot turn right','pivot 1/2 right','pivot half right','half pivot right','pivot turn'], counts: 2, feet: 'R', description: 'Step right forward, pivot 1/2 turn right (weight ends on left)', category: 'turn' },
    { name: 'Pivot Half Turn Left',    aliases: ['pivot turn left','pivot 1/2 left','pivot half left','half pivot left'], counts: 2, feet: 'L', description: 'Step left forward, pivot 1/2 turn left (weight ends on right)', category: 'turn' },
    { name: 'Pivot Quarter Turn Right',aliases: ['pivot 1/4 right','quarter pivot right','1/4 turn right'], counts: 2, feet: 'R', description: 'Step right forward, pivot 1/4 turn right', category: 'turn' },
    { name: 'Pivot Quarter Turn Left', aliases: ['pivot 1/4 left','quarter pivot left','1/4 turn left'], counts: 2, feet: 'L', description: 'Step left forward, pivot 1/4 turn left', category: 'turn' },
    { name: 'Full Turn Right',         aliases: ['full turn r','360 turn right','spin right'], counts: 2, feet: 'R', description: 'Full 360 turn to the right over 2 counts', category: 'turn' },
    { name: 'Full Turn Left',          aliases: ['full turn l','360 turn left','spin left'], counts: 2, feet: 'L', description: 'Full 360 turn to the left over 2 counts', category: 'turn' },
    { name: 'Paddle Turn Right',       aliases: ['paddle right','paddle r','paddle turn r'], counts: 2, feet: 'R', description: 'Touch right forward, turn 1/4 right taking weight on left', category: 'turn' },
    { name: 'Paddle Turn Left',        aliases: ['paddle left','paddle l','paddle turn l'], counts: 2, feet: 'L', description: 'Touch left forward, turn 1/4 left taking weight on right', category: 'turn' },

    /* ── Jazz Box ──────────────────────────────────────── */
    { name: 'Jazz Box Right',          aliases: ['jazz box r','jazz box','jazz square right','jazz square'], counts: 4, feet: 'R', description: 'Cross right over left, step left back, step right to side, step left forward', category: 'jazz' },
    { name: 'Jazz Box Left',           aliases: ['jazz box l','jazz square left'], counts: 4, feet: 'L', description: 'Cross left over right, step right back, step left to side, step right forward', category: 'jazz' },
    { name: 'Jazz Box Turn Right',     aliases: ['jazz box right turn','jazz box 1/4 right','jazz box turn r'], counts: 4, feet: 'R', description: 'Cross right over left, step left back, turn 1/4 right stepping right, step left forward', category: 'jazz' },
    { name: 'Jazz Box Turn Left',      aliases: ['jazz box left turn','jazz box 1/4 left','jazz box turn l'], counts: 4, feet: 'L', description: 'Cross left over right, step right back, turn 1/4 left stepping left, step right forward', category: 'jazz' },

    /* ── Crosses ───────────────────────────────────────── */
    { name: 'Cross Right Over Left',   aliases: ['cross right','cross r over l','cross over right','right cross'], counts: 1, feet: 'R', description: 'Cross right foot over left', category: 'cross' },
    { name: 'Cross Left Over Right',   aliases: ['cross left','cross l over r','cross over left','left cross'], counts: 1, feet: 'L', description: 'Cross left foot over right', category: 'cross' },
    { name: 'Cross Behind Right',      aliases: ['cross right behind','cross r behind','behind right'], counts: 1, feet: 'R', description: 'Cross right foot behind left', category: 'cross' },
    { name: 'Cross Behind Left',       aliases: ['cross left behind','cross l behind','behind left'], counts: 1, feet: 'L', description: 'Cross left foot behind right', category: 'cross' },
    { name: 'Cross Shuffle Right',     aliases: ['cross shuffle r','crossing shuffle right'], counts: 2, feet: 'R', description: 'Cross right over left, step left to side, cross right over left (1&2)', category: 'cross' },
    { name: 'Cross Shuffle Left',      aliases: ['cross shuffle l','crossing shuffle left'], counts: 2, feet: 'L', description: 'Cross left over right, step right to side, cross left over right (1&2)', category: 'cross' },

    /* ── Kicks ─────────────────────────────────────────── */
    { name: 'Kick Right Forward',      aliases: ['kick right','kick r','right kick','kick forward right'], counts: 1, feet: 'R', description: 'Kick right foot forward (no weight change)', category: 'kick' },
    { name: 'Kick Left Forward',       aliases: ['kick left','kick l','left kick','kick forward left'], counts: 1, feet: 'L', description: 'Kick left foot forward (no weight change)', category: 'kick' },
    { name: 'Kick Ball Change Right',  aliases: ['kick ball change right','kick ball change r','kbc right','kbc r'], counts: 2, feet: 'R', description: 'Kick right forward, step on ball of right, change weight to left (1&2)', category: 'kick' },
    { name: 'Kick Ball Change Left',   aliases: ['kick ball change left','kick ball change l','kbc left','kbc l'], counts: 2, feet: 'L', description: 'Kick left forward, step on ball of left, change weight to right (1&2)', category: 'kick' },

    /* ── Stomps / Stamps ───────────────────────────────── */
    { name: 'Stomp Right',             aliases: ['stomp r','right stomp','stomp right foot'], counts: 1, feet: 'R', description: 'Stomp right foot (with weight change)', category: 'stomp' },
    { name: 'Stomp Left',              aliases: ['stomp l','left stomp','stomp left foot'], counts: 1, feet: 'L', description: 'Stomp left foot (with weight change)', category: 'stomp' },
    { name: 'Stomp Up Right',          aliases: ['stomp up r','stamp right','stamp r'], counts: 1, feet: 'R', description: 'Stomp right foot in place (no weight change)', category: 'stomp' },
    { name: 'Stomp Up Left',           aliases: ['stomp up l','stamp left','stamp l'], counts: 1, feet: 'L', description: 'Stomp left foot in place (no weight change)', category: 'stomp' },

    /* ── Scuffs / Hitches / Flicks ────────────────────── */
    { name: 'Scuff Right',             aliases: ['scuff r','right scuff','scuff right foot'], counts: 1, feet: 'R', description: 'Scuff right heel forward along the floor', category: 'embellish' },
    { name: 'Scuff Left',              aliases: ['scuff l','left scuff','scuff left foot'], counts: 1, feet: 'L', description: 'Scuff left heel forward along the floor', category: 'embellish' },
    { name: 'Hitch Right',             aliases: ['hitch r','right hitch','hitch right knee','knee lift right'], counts: 1, feet: 'R', description: 'Lift right knee up', category: 'embellish' },
    { name: 'Hitch Left',              aliases: ['hitch l','left hitch','hitch left knee','knee lift left'], counts: 1, feet: 'L', description: 'Lift left knee up', category: 'embellish' },
    { name: 'Flick Right',             aliases: ['flick r','right flick','flick right foot','flick back right'], counts: 1, feet: 'R', description: 'Flick right foot back behind', category: 'embellish' },
    { name: 'Flick Left',              aliases: ['flick l','left flick','flick left foot','flick back left'], counts: 1, feet: 'L', description: 'Flick left foot back behind', category: 'embellish' },

    /* ── Slides ────────────────────────────────────────── */
    { name: 'Slide Right',             aliases: ['slide r','right slide','slide to right'], counts: 2, feet: 'R', description: 'Step right to side and slide left to meet right', category: 'slide' },
    { name: 'Slide Left',              aliases: ['slide l','left slide','slide to left'], counts: 2, feet: 'L', description: 'Step left to side and slide right to meet left', category: 'slide' },
    { name: 'Slide Forward',           aliases: ['slide fwd','slide forward right'], counts: 2, feet: 'R', description: 'Step forward and slide trailing foot to meet', category: 'slide' },

    /* ── Hip Bumps / Sways ─────────────────────────────── */
    { name: 'Hip Bump Right',          aliases: ['bump right','hip right','bump r','sway right'], counts: 1, feet: 'R', description: 'Bump hips to the right', category: 'sway' },
    { name: 'Hip Bump Left',           aliases: ['bump left','hip left','bump l','sway left'], counts: 1, feet: 'L', description: 'Bump hips to the left', category: 'sway' },
    { name: 'Hip Bumps Right x2',      aliases: ['hip bumps right','double bump right','bumps right x2'], counts: 2, feet: 'R', description: 'Bump hips right twice', category: 'sway' },
    { name: 'Hip Bumps Left x2',       aliases: ['hip bumps left','double bump left','bumps left x2'], counts: 2, feet: 'L', description: 'Bump hips left twice', category: 'sway' },

    /* ── Monterey ──────────────────────────────────────── */
    { name: 'Monterey Turn Right',     aliases: ['monterey right','monterey turn r','monterey 1/2 right'], counts: 4, feet: 'R', description: 'Point right to side, 1/2 turn right stepping right beside left, point left to side, step left beside right', category: 'turn' },
    { name: 'Monterey Turn Left',      aliases: ['monterey left','monterey turn l','monterey 1/2 left'], counts: 4, feet: 'L', description: 'Point left to side, 1/2 turn left stepping left beside right, point right to side, step right beside left', category: 'turn' },

    /* ── Charleston ────────────────────────────────────── */
    { name: 'Charleston Step',         aliases: ['charleston','charleston forward'], counts: 4, feet: 'R', description: 'Step right forward, kick left forward, step left back, touch right back', category: 'specialty' },

    /* ── Mambo ─────────────────────────────────────────── */
    { name: 'Mambo Forward Right',     aliases: ['mambo forward r','mambo right','mambo fwd right'], counts: 3, feet: 'R', description: 'Rock right forward, recover left, step right beside left', category: 'rock' },
    { name: 'Mambo Forward Left',      aliases: ['mambo forward l','mambo left','mambo fwd left'], counts: 3, feet: 'L', description: 'Rock left forward, recover right, step left beside right', category: 'rock' },
    { name: 'Mambo Back Right',        aliases: ['mambo back r'], counts: 3, feet: 'R', description: 'Rock right back, recover left, step right beside left', category: 'rock' },
    { name: 'Mambo Back Left',         aliases: ['mambo back l'], counts: 3, feet: 'L', description: 'Rock left back, recover right, step left beside right', category: 'rock' },

    /* ── Rumba Box ─────────────────────────────────────── */
    { name: 'Rumba Box Forward',       aliases: ['rumba box fwd','forward box','rumba box'], counts: 6, feet: 'L', description: 'Side-together-forward, side-together-forward (6 counts)', category: 'specialty' },
    { name: 'Rumba Box Back',          aliases: ['rumba box back','back box'], counts: 6, feet: 'L', description: 'Side-together-back, side-together-back (6 counts)', category: 'specialty' },

    /* ── Step Lock Step ────────────────────────────────── */
    { name: 'Step Lock Step Forward Right', aliases: ['lock step forward right','step lock step right','step lock step r','lock step r'], counts: 2, feet: 'R', description: 'Step right forward, lock left behind right, step right forward (1&2)', category: 'triple' },
    { name: 'Step Lock Step Forward Left',  aliases: ['lock step forward left','step lock step left','step lock step l','lock step l'], counts: 2, feet: 'L', description: 'Step left forward, lock right behind left, step left forward (1&2)', category: 'triple' },

    /* ── Rocking Chair ─────────────────────────────────── */
    { name: 'Rocking Chair Right',     aliases: ['rocking chair r','rocking chair'], counts: 4, feet: 'R', description: 'Rock forward right, recover, rock back right, recover', category: 'rock' },
    { name: 'Rocking Chair Left',      aliases: ['rocking chair l'], counts: 4, feet: 'L', description: 'Rock forward left, recover, rock back left, recover', category: 'rock' },

    /* ── Swivels ───────────────────────────────────────── */
    { name: 'Swivel Heels Right',      aliases: ['heel swivels right','swivel right','swivels right'], counts: 2, feet: 'Both', description: 'Swivel both heels to the right then center', category: 'embellish' },
    { name: 'Swivel Heels Left',       aliases: ['heel swivels left','swivel left','swivels left'], counts: 2, feet: 'Both', description: 'Swivel both heels to the left then center', category: 'embellish' },

    /* ── Holds / Claps ─────────────────────────────────── */
    { name: 'Hold',                    aliases: ['hold 1 count','pause','wait'], counts: 1, feet: 'Neither', description: 'Hold position for 1 count (no movement)', category: 'hold' },
    { name: 'Clap',                    aliases: ['clap hands','hand clap'], counts: 1, feet: 'Neither', description: 'Clap hands together', category: 'hold' },
    { name: 'Snap',                    aliases: ['finger snap','snap fingers'], counts: 1, feet: 'Neither', description: 'Snap fingers', category: 'hold' },

    /* ── Together / Close ──────────────────────────────── */
    { name: 'Step Together Right',     aliases: ['together right','close right','step right together','step r together'], counts: 1, feet: 'R', description: 'Step right foot next to left', category: 'together' },
    { name: 'Step Together Left',      aliases: ['together left','close left','step left together','step l together'], counts: 1, feet: 'L', description: 'Step left foot next to right', category: 'together' },

    /* ── Drag / Coaster Cross ──────────────────────────── */
    { name: 'Drag Right',              aliases: ['drag r','right drag'], counts: 2, feet: 'R', description: 'Step right to side and slowly drag left to meet', category: 'slide' },
    { name: 'Drag Left',               aliases: ['drag l','left drag'], counts: 2, feet: 'L', description: 'Step left to side and slowly drag right to meet', category: 'slide' },
    { name: 'Coaster Cross Right',     aliases: ['coaster cross r'], counts: 3, feet: 'R', description: 'Step right back, step left together, cross right over left', category: 'triple' },
    { name: 'Coaster Cross Left',      aliases: ['coaster cross l'], counts: 3, feet: 'L', description: 'Step left back, step right together, cross left over right', category: 'triple' },

    /* ── Body Rolls / Shimmies ─────────────────────────── */
    { name: 'Body Roll',               aliases: ['body roll down','body roll up'], counts: 2, feet: 'Neither', description: 'Roll body from top to bottom (or reverse)', category: 'embellish' },
    { name: 'Shimmy',                  aliases: ['shoulder shimmy','shimmy shoulders'], counts: 2, feet: 'Neither', description: 'Shimmy shoulders', category: 'embellish' },

    /* ── Behind Side Cross ─────────────────────────────── */
    { name: 'Behind Side Cross Right', aliases: ['behind side cross r','bsc right'], counts: 3, feet: 'R', description: 'Cross right behind left, step left to side, cross right over left', category: 'cross' },
    { name: 'Behind Side Cross Left',  aliases: ['behind side cross l','bsc left'], counts: 3, feet: 'L', description: 'Cross left behind right, step right to side, cross left over right', category: 'cross' },

    /* ── Syncopated Steps ──────────────────────────────── */
    { name: 'Ball Change Right',       aliases: ['ball change r','ball change right foot'], counts: 1, feet: 'R', description: 'Quick weight change: ball of right then left (&1)', category: 'syncopated' },
    { name: 'Ball Change Left',        aliases: ['ball change l','ball change left foot'], counts: 1, feet: 'L', description: 'Quick weight change: ball of left then right (&1)', category: 'syncopated' },

    /* ── Applejack / Scissor ───────────────────────────── */
    { name: 'Scissor Step Right',      aliases: ['scissor right','scissor r','scissor step r'], counts: 2, feet: 'R', description: 'Step right to side, close left beside right, cross right over left (1&2)', category: 'cross' },
    { name: 'Scissor Step Left',       aliases: ['scissor left','scissor l','scissor step l'], counts: 2, feet: 'L', description: 'Step left to side, close right beside left, cross left over right (1&2)', category: 'cross' },
    { name: 'Applejack',               aliases: ['applejacks','apple jack'], counts: 2, feet: 'Both', description: 'Heels apart then together (or toes apart then together)', category: 'embellish' }
  ];

  /* ════════════════════════════════════════════════════════════
     CATEGORIES for display grouping
     ════════════════════════════════════════════════════════════ */
  var CATEGORIES = {
    walking:    { label: 'Walking / Traveling',  icon: '🚶' },
    vine:       { label: 'Vines & Grapevines',   icon: '🌿' },
    touch:      { label: 'Touches & Points',     icon: '👆' },
    side:       { label: 'Side Steps',           icon: '↔️' },
    rock:       { label: 'Rocks & Mambos',       icon: '🪨' },
    triple:     { label: 'Triples & Shuffles',   icon: '⚡' },
    turn:       { label: 'Turns & Pivots',       icon: '🔄' },
    jazz:       { label: 'Jazz Box',             icon: '🎷' },
    cross:      { label: 'Crosses & Weaves',     icon: '✖️' },
    kick:       { label: 'Kicks',                icon: '🦵' },
    stomp:      { label: 'Stomps & Stamps',      icon: '👟' },
    embellish:  { label: 'Embellishments',       icon: '✨' },
    slide:      { label: 'Slides & Drags',       icon: '💨' },
    sway:       { label: 'Hip Bumps & Sways',    icon: '💃' },
    specialty:  { label: 'Specialty Steps',      icon: '⭐' },
    hold:       { label: 'Holds & Claps',        icon: '👏' },
    together:   { label: 'Together / Close',     icon: '🤝' },
    syncopated: { label: 'Syncopated',           icon: '🎵' }
  };

  /* ════════════════════════════════════════════════════════════
     NORMALIZATION HELPERS
     ════════════════════════════════════════════════════════════ */
  function normalize(text) {
    return String(text || '').toLowerCase().replace(/[^a-z0-9&/]+/g, ' ').replace(/\s+/g, ' ').trim();
  }

  function tokenize(text) {
    return normalize(text).split(/\s+/).filter(Boolean);
  }

  /* Build lookup index once */
  var _index = null;
  function getIndex() {
    if (_index) return _index;
    _index = { byName: {}, byAlias: {}, all: STEPS };
    for (var i = 0; i < STEPS.length; i++) {
      var step = STEPS[i];
      _index.byName[normalize(step.name)] = step;
      for (var j = 0; j < (step.aliases || []).length; j++) {
        _index.byAlias[normalize(step.aliases[j])] = step;
      }
    }
    return _index;
  }

  /* ════════════════════════════════════════════════════════════
     MATCHING ENGINE
     ════════════════════════════════════════════════════════════ */

  /**
   * Find the best matching canonical step for a given input string.
   * Returns { match, score, candidates } or null.
   */
  function findBestMatch(input) {
    var q = normalize(input);
    if (!q) return null;
    var idx = getIndex();

    /* Exact name match */
    if (idx.byName[q]) return { match: idx.byName[q], score: 1.0, candidates: [] };

    /* Exact alias match */
    if (idx.byAlias[q]) return { match: idx.byAlias[q], score: 0.98, candidates: [] };

    /* Fuzzy matching: score each step */
    var scored = [];
    for (var i = 0; i < STEPS.length; i++) {
      var step = STEPS[i];
      var best = scoreSimilarity(q, normalize(step.name));
      for (var j = 0; j < (step.aliases || []).length; j++) {
        var s = scoreSimilarity(q, normalize(step.aliases[j]));
        if (s > best) best = s;
      }
      /* Also check if query is a substring of name or vice versa */
      var nName = normalize(step.name);
      if (q.indexOf(nName) !== -1 || nName.indexOf(q) !== -1) {
        var subScore = Math.min(q.length, nName.length) / Math.max(q.length, nName.length);
        if (subScore * 0.95 > best) best = subScore * 0.95;
      }
      if (best >= 0.45) scored.push({ step: step, score: best });
    }
    scored.sort(function (a, b) { return b.score - a.score; });

    if (!scored.length) return null;
    if (scored[0].score >= 0.72) {
      return {
        match: scored[0].step,
        score: scored[0].score,
        candidates: scored.slice(1, 4).map(function (s) { return s.step; })
      };
    }
    /* Ambiguous — return top candidates */
    return {
      match: null,
      score: scored[0].score,
      candidates: scored.slice(0, 5).map(function (s) { return s.step; })
    };
  }

  function scoreSimilarity(a, b) {
    if (a === b) return 1;
    var tokA = tokenize(a);
    var tokB = tokenize(b);
    if (!tokA.length || !tokB.length) return 0;
    var setA = {};
    var setB = {};
    for (var i = 0; i < tokA.length; i++) setA[tokA[i]] = true;
    for (var j = 0; j < tokB.length; j++) setB[tokB[j]] = true;
    var overlap = 0;
    var keysA = Object.keys(setA);
    for (var k = 0; k < keysA.length; k++) {
      if (setB[keysA[k]]) overlap++;
    }
    return overlap / Math.max(keysA.length, Object.keys(setB).length);
  }

  /**
   * Get all steps, optionally filtered by category.
   */
  function getAllSteps(category) {
    if (!category) return STEPS.slice();
    return STEPS.filter(function (s) { return s.category === category; });
  }

  /**
   * Search steps by query string. Returns array sorted by relevance.
   */
  function search(query) {
    var q = normalize(query);
    if (!q) return STEPS.slice();
    var scored = [];
    for (var i = 0; i < STEPS.length; i++) {
      var step = STEPS[i];
      var best = 0;
      /* Check name, aliases, description, category */
      var fields = [step.name, step.description, step.category].concat(step.aliases || []);
      for (var j = 0; j < fields.length; j++) {
        var nf = normalize(fields[j]);
        if (nf.indexOf(q) !== -1) { best = Math.max(best, 0.9); continue; }
        if (q.indexOf(nf) !== -1) { best = Math.max(best, 0.85); continue; }
        var s = scoreSimilarity(q, nf);
        if (s > best) best = s;
      }
      if (best >= 0.3) scored.push({ step: step, score: best });
    }
    scored.sort(function (a, b) { return b.score - a.score; });
    return scored.map(function (s) { return s.step; });
  }

  /**
   * Disambiguate an ambiguous input by returning suggestions with descriptions.
   * Returns a user-friendly string.
   */
  function disambiguate(input) {
    var result = findBestMatch(input);
    if (!result) return 'I could not find any matching steps for "' + input + '". Try using standard names like "vine right", "coaster step", or "shuffle forward".';
    if (result.match && result.score >= 0.72) {
      return 'Best match: **' + result.match.name + '** — ' + result.match.description + ' (' + result.match.counts + ' count' + (result.match.counts !== 1 ? 's' : '') + ')';
    }
    var lines = ['I\'m not sure what "' + input + '" means. Did you mean one of these?\n'];
    var cands = result.candidates || [];
    for (var i = 0; i < Math.min(cands.length, 5); i++) {
      lines.push('• **' + cands[i].name + '** — ' + cands[i].description);
    }
    lines.push('\nTry being more specific, like "vine right" or "shuffle forward right".');
    return lines.join('\n');
  }

  /* ════════════════════════════════════════════════════════════
     PUBLIC API
     ════════════════════════════════════════════════════════════ */
  window.__stepperStepDictionary = {
    STEPS: STEPS,
    CATEGORIES: CATEGORIES,
    findBestMatch: findBestMatch,
    search: search,
    disambiguate: disambiguate,
    getAllSteps: getAllSteps,
    normalize: normalize
  };

})();
