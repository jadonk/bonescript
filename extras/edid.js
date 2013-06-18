// From https://github.com/dgallegos/edidreader/blob/master/app/js/edid.js
/*
 * The MIT License
 * 
 * Copyright (c) 2012-2013 David Gallegos
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to
 * deal in the Software without restriction, including without limitation the
 * rights to use, copy, modify, merge, publish, distribute, sublicense, and/or
 * sell copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS
 * IN THE SOFTWARE.
 */

function Edid () {
  this.EDID_BLOCK_LENGTH = 128;
  this.WhiteAndSyncLevels = ["+0.7/−0.3 V", "+0.714/−0.286 V",
                               "+1.0/−0.4 V", "+0.7/0 V"];
  this.digitalColorSpace = ["RGB 4:4:4", "RGB 4:4:4 + YCrCb 4:4:4",
                              "RGB 4:4:4 + YCrCb 4:2:2",
                              "RGB 4:4:4 + YCrCb 4:4:4 + YCrCb 4:2:2"];
  this.analogColorSpace = ["Monochrome or Grayscale",
                            "RGB color", "Non-RGB color", "Undefined"];
  this.establishedTimingBitmaps = ["720×400 @ 70 Hz",
                                    "720×400 @ 88 Hz",
                                    "640×480 @ 60 Hz",
                                    "640×480 @ 67 Hz",
                                    "640×480 @ 72 Hz",
                                    "640×480 @ 75 Hz",
                                    "800×600 @ 56 Hz",
                                    "800×600 @ 60 Hz",
                                    "800×600 @ 72 Hz",
                                    "800×600 @ 75 Hz",
                                    "832×624 @ 75 Hz",
                                    "1024×768i @ 87 Hz",
                                    "1024×768 @ 60 Hz",
                                    "1024×768 @ 72 Hz",
                                    "1024×768 @ 75 Hz",
                                    "1280×1024 @ 75 Hz",
                                    "1152x870 @ 75 Hz"];
  this.DTD_LENGTH = 18;

  this.xyPixelRatioEnum = [{"string":"16:10"},
                           {"string":"4:3"},
                           {"string":"5:4"},
                           {"string":"16:9"}];

  this.syncTypeEnum = {"ANALOG_COMPOSITE" : 0x00,
                    "BIPOLAR_ANALOG_COMPOSITE" : 0x01,
                      "DIGITAL_COMPOSITE" : 0x02,
                      "DIGITAL_SEPARATE" : 0x03};

  this.dataBlockType = {
    RESERVED : {string:"RESERVED",value:0},
    AUDIO : {string:"AUDIO",value:1},
    VIDEO : {string:"VIDEO",value:2},
    VENDOR_SPECIFIC : {string:"VENDOR SPECIFIC",value:3},
    SPEAKER_ALLOCATION : {string:"SPEAKER ALLOCATION",value:4}};

  this.audioFormatArray = [1,8,13,14,15]
  this.shortAudioDescriptors = ["RESERVED","LPCM","AC-3","MPEG-1","MP3","MPEG2","AAC LC",
                                  "DTS","ATRAC","DSD","E-AC-3","DTS-HD","MLP","DST","WMA Pro"];
  this.sadSampleRates = ["32 kHz", "44.1 kHz", "48 kHz", "88.2 kHz", "96 kHz", "176.4 kHz", "192 kHz"];
  this.sadBitDepths = ["16 bit", "20 bit", "24 bit"];
  this.shortVideoDescriptors = [{"vic":0},
    {"vic":1, "format":"640x480p", "fieldRate":"59.94Hz/60Hz", "pictureAspectRatio":"4:3", "pixelAspectRatio":"1:1"},
    {"vic":2, "format":"720x480p", "fieldRate":"59.94Hz/60Hz", "pictureAspectRatio":"4:3", "pixelAspectRatio":"8:9"},
    {"vic":3, "format":"720x480p", "fieldRate":"59.94Hz/60Hz", "pictureAspectRatio":"16:9", "pixelAspectRatio":"32:27"},
    {"vic":4, "format":"1280x720p", "fieldRate":"59.94Hz/60Hz", "pictureAspectRatio":"16:9", "pixelAspectRatio":"1:1"},
    {"vic":5, "format":"1920x1080i", "fieldRate":"59.94Hz/60Hz", "pictureAspectRatio":"16:9", "pixelAspectRatio":"1:1"},
    {"vic":6, "format":"720(1440)x480i", "fieldRate":"59.94Hz/60Hz", "pictureAspectRatio":"4:3", "pixelAspectRatio":"8:9"},
    {"vic":7, "format":"720(1440)x480i", "fieldRate":"59.94Hz/60Hz", "pictureAspectRatio":"16:9", "pixelAspectRatio":"32:27"},
    {"vic":8, "format":"720(1440)x240p", "fieldRate":"59.94Hz/60Hz", "pictureAspectRatio":"4:3", "pixelAspectRatio":"4:9"},
    {"vic":9, "format":"720(1440)x240p", "fieldRate":"59.94Hz/60Hz", "pictureAspectRatio":"16:9", "pixelAspectRatio":"16:27"},
    {"vic":10, "format":"2880x480i", "fieldRate":"59.94Hz/60Hz", "pictureAspectRatio":"4:3", "pixelAspectRatio":"2:9 – 20:9"},
    {"vic":11, "format":"2880x480i", "fieldRate":"59.94Hz/60Hz", "pictureAspectRatio":"16:9", "pixelAspectRatio":"8:27 -80:27"},
    {"vic":12, "format":"2880x240p", "fieldRate":"59.94Hz/60Hz", "pictureAspectRatio":"4:3", "pixelAspectRatio":"1:9 – 10:9"},
    {"vic":13, "format":"2880x240p", "fieldRate":"59.94Hz/60Hz", "pictureAspectRatio":"16:9", "pixelAspectRatio":"4:27 – 40:27"},
    {"vic":14, "format":"1440x480p", "fieldRate":"59.94Hz/60Hz", "pictureAspectRatio":"4:3", "pixelAspectRatio":"4:9 or 8:9"},
    {"vic":15, "format":"1440x480p", "fieldRate":"59.94Hz/60Hz", "pictureAspectRatio":"16:9", "pixelAspectRatio":"16:27 or 32:27"},
    {"vic":16, "format":"1920x1080p", "fieldRate":"59.94Hz/60Hz", "pictureAspectRatio":"16:9", "pixelAspectRatio":"1:1"},
    {"vic":17, "format":"720x576p", "fieldRate":"50Hz", "pictureAspectRatio":"4:3", "pixelAspectRatio":"16:15"},
    {"vic":18, "format":"720x576p", "fieldRate":"50Hz", "pictureAspectRatio":"16:9", "pixelAspectRatio":"64:45"},
    {"vic":19, "format":"1280x720p", "fieldRate":"50Hz", "pictureAspectRatio":"16:9", "pixelAspectRatio":"1:1"},
    {"vic":20, "format":"1920x1080i", "fieldRate":"50Hz", "pictureAspectRatio":"16:9", "pixelAspectRatio":"1:1"},
    {"vic":21, "format":"720(1440)x576i", "fieldRate":"50Hz", "pictureAspectRatio":"4:3", "pixelAspectRatio":"16:15"},
    {"vic":22, "format":"720(1440)x576i", "fieldRate":"50Hz", "pictureAspectRatio":"16:9", "pixelAspectRatio":"64:45"},
    {"vic":23, "format":"720(1440)x288p", "fieldRate":"50Hz", "pictureAspectRatio":"4:3", "pixelAspectRatio":"8:15"},
    {"vic":24, "format":"720(1440)x288p", "fieldRate":"50Hz", "pictureAspectRatio":"16:9", "pixelAspectRatio":"32:45"},
    {"vic":25, "format":"2880x576i", "fieldRate":"50Hz", "pictureAspectRatio":"4:3", "pixelAspectRatio":"2:15 – 20:15"},
    {"vic":26, "format":"2880x576i", "fieldRate":"50Hz", "pictureAspectRatio":"16:9", "pixelAspectRatio":"16:45-160:45"},
    {"vic":27, "format":"2880x288p", "fieldRate":"50Hz", "pictureAspectRatio":"4:3", "pixelAspectRatio":"1:15 – 10:15"},
    {"vic":28, "format":"2880x288p", "fieldRate":"50Hz", "pictureAspectRatio":"16:9", "pixelAspectRatio":"8:45 – 80:45"},
    {"vic":29, "format":"1440x576p", "fieldRate":"50Hz", "pictureAspectRatio":"4:3", "pixelAspectRatio":"8:15 or 16:15"},
    {"vic":30, "format":"1440x576p", "fieldRate":"50Hz", "pictureAspectRatio":"16:9", "pixelAspectRatio":"32:45 or 64:45"},
    {"vic":31, "format":"1920x1080p", "fieldRate":"50Hz", "pictureAspectRatio":"16:9", "pixelAspectRatio":"1:1"},
    {"vic":32, "format":"1920x1080p", "fieldRate":"23.97Hz/24Hz", "pictureAspectRatio":"16:9", "pixelAspectRatio":"1:1"},
    {"vic":33, "format":"1920x1080p", "fieldRate":"25Hz", "pictureAspectRatio":"16:9", "pixelAspectRatio":"1:1"},
    {"vic":34, "format":"1920x1080p", "fieldRate":"29.97Hz/30Hz", "pictureAspectRatio":"16:9", "pixelAspectRatio":"1:1"},
    {"vic":35, "format":"2880x480p", "fieldRate":"59.94Hz/60Hz",  "pictureAspectRatio":"4:3", "pixelAspectRatio":"2:9, 4:9, or 8:9"},
    {"vic":36, "format":"2880x480p", "fieldRate":"59.94Hz/60Hz",  "pictureAspectRatio":"16:9", "pixelAspectRatio":"8:27, 16:27, or 32:27"},
    {"vic":37, "format":"2880x576p", "fieldRate":"50Hz", "pictureAspectRatio":"4:3", "pixelAspectRatio":"4:15, 8:15, or 16:15"},
    {"vic":38, "format":"2880x576p", "fieldRate":"50Hz", "pictureAspectRatio":"16:9",  "pixelAspectRatio":"16:45, 32:45, or 64:45"},
    {"vic":39, "format":"1920x1080i (1250 total)", "fieldRate":"50Hz", "pictureAspectRatio":"16:9", "pixelAspectRatio":"1:1"},
    {"vic":40, "format":"1920x1080i", "fieldRate":"100Hz", "pictureAspectRatio":"16:9", "pixelAspectRatio":"1:1"},
    {"vic":41, "format":"1280x720p", "fieldRate":"100Hz", "pictureAspectRatio":"16:9", "pixelAspectRatio":"1:1"},
    {"vic":42, "format":"720x576p", "fieldRate":"100Hz", "pictureAspectRatio":"4:3", "pixelAspectRatio":"16:15"},
    {"vic":43, "format":"720x576p", "fieldRate":"100Hz", "pictureAspectRatio":"16:9", "pixelAspectRatio":"64:45"},
    {"vic":44, "format":"720(1440)x576i", "fieldRate":"100Hz", "pictureAspectRatio":"4:3", "pixelAspectRatio":"16:15"},
    {"vic":45, "format":"720(1440)x576i", "fieldRate":"100Hz", "pictureAspectRatio":"16:9", "pixelAspectRatio":"64:45"},
    {"vic":46, "format":"1920x1080i", "fieldRate":"119.88/120Hz", "pictureAspectRatio":"16:9", "pixelAspectRatio":"1:1"},
    {"vic":47, "format":"1280x720p", "fieldRate":"119.88/120Hz", "pictureAspectRatio":"16:9", "pixelAspectRatio":"1:1"},
    {"vic":48, "format":"720x480p", "fieldRate":"119.88/120Hz", "pictureAspectRatio":"4:3", "pixelAspectRatio":"8:9"},
    {"vic":49, "format":"720x480p", "fieldRate":"119.88/120Hz", "pictureAspectRatio":"16:9", "pixelAspectRatio":"32:27"},
    {"vic":50, "format":"720(1440)x480i", "fieldRate":"119.88/120Hz", "pictureAspectRatio":"4:3", "pixelAspectRatio":"8:9"},
    {"vic":51, "format":"720(1440)x480i", "fieldRate":"119.88/120Hz", "pictureAspectRatio":"16:9", "pixelAspectRatio":"32:27"},
    {"vic":52, "format":"720x576p", "fieldRate":"200Hz", "pictureAspectRatio":"4:3", "pixelAspectRatio":"16:15"},
    {"vic":53, "format":"720x576p", "fieldRate":"200Hz", "pictureAspectRatio":"16:9", "pixelAspectRatio":"64:45"},
    {"vic":54, "format":"720(1440)x576i", "fieldRate":"200Hz", "pictureAspectRatio":"4:3", "pixelAspectRatio":"16:15"},
    {"vic":55, "format":"720(1440)x576i", "fieldRate":"200Hz", "pictureAspectRatio":"16:9", "pixelAspectRatio":"64:45"},
    {"vic":56, "format":"720x480p", "fieldRate":"239.76/240Hz", "pictureAspectRatio":"4:3", "pixelAspectRatio":"8:9"},
    {"vic":57, "format":"720x480p", "fieldRate":"239.76/240Hz", "pictureAspectRatio":"16:9", "pixelAspectRatio":"32:27"},
    {"vic":58, "format":"720(1440)x480i", "fieldRate":"239.76/240Hz", "pictureAspectRatio":"4:3", "pixelAspectRatio":"8:9"},
    {"vic":59, "format":"720(1440)x480i", "fieldRate":"239.76/240Hz", "pictureAspectRatio":"16:9", "pixelAspectRatio":"32:27"},
    {"vic":60, "format":"1280x720p", "fieldRate":"23.97Hz/24Hz", "pictureAspectRatio":"16:9", "pixelAspectRatio":"1:1"},
    {"vic":61, "format":"1280x720p", "fieldRate":"25Hz", "pictureAspectRatio":"16:9", "pixelAspectRatio":"1:1"},
    {"vic":62, "format":"1280x720p", "fieldRate":"29.97Hz/30Hz", "pictureAspectRatio":"16:9", "pixelAspectRatio":"1:1"},
    {"vic":63, "format":"1920x1080p", "fieldRate":"119.88/120Hz", "pictureAspectRatio":"16:9", "pixelAspectRatio":"1:1"},
    {"vic":64, "format":"1920x1080p", "fieldRate":"100Hz", "pictureAspectRatio":"16:9", "pixelAspectRatio":"1:1"}]
  this.speakerAllocation = ["Front Left/Front Right (FL/FR)", "Low Frequency Effort (LFE)",
                    "Front Center (FC)", "Rear Left/Rear Right (RL/RR)",
                    "Rear Center (RC)", "Front Left Center/Front Right Center (FLC/FRC)",
                    "Rear Left Center/Rear Right Center (RLC/RRC)",
                    "Front Left Wide/Front Right Wide (FLW/FRW)",
                    "Front Left High/Frong Right High (FLH/FRH)",
                    "Top Center (TC)", "Front Center High (FCH)"];
}

Edid.prototype.setEdidData = function(edid)
{
  this.edidData = edid;
}

Edid.prototype.parse = function()
{
  if(this.validateHeader() == true)
  {
    this.validHeader = "OK";
  }
  else
  {
    this.validHeader = "ERROR";
  }

  this.eisaId = this.getEisaId();

  this.productCode = this.getProductCode();

  this.serialNumber = this.getSerialNumber();

  this.manufactureDate = this.getManufactureWeek()+"/"+
                              this.getManufactureYear();

  this.edidVersion = this.getEdidVersion()+"."+
                          this.getEdidRevision();

  this.bdp = this.getBasicDisplayParams();

  this.chromaticity = this.getChromaticityCoordinates();

  this.timingBitmap = this.getTimingBitmap();

  this.standardDisplayModes = this.getStandardDisplayModes();

  this.dtds = this.getDtds();

  this.numberOfExtensions = this.getNumberExtensions();

  this.checksum = this.getChecksum();

  this.exts = new Array();
  // Begin Parsing Extension blocks
  for(var extIndex = 0; extIndex < this.numberOfExtensions; extIndex++)
  {
    this.exts[extIndex] = new Object();
    this.exts[extIndex].extTag = this.getExtTag(extIndex);
    this.exts[extIndex].revisionNumber = this.getRevisionNumber(extIndex);
    this.exts[extIndex].dtdStart = this.getDtdStart(extIndex);
    this.exts[extIndex].numDtds = this.getNumberExtDtds(extIndex);
    this.exts[extIndex].underscan = this.getUnderscan(extIndex);
    this.exts[extIndex].basicAudio = this.getBasicAudio(extIndex);
    this.exts[extIndex].ycbcr444 = this.getYcBcR444(extIndex);
    this.exts[extIndex].ycbcr422 = this.getYcBcR422(extIndex);
    // If DTDs don't start at byte 4
    if(this.exts[extIndex].dtdStart != 4)
    {
      // Parse Data Collection block
      this.exts[extIndex].dataBlockCollection = this.parseDataBlockCollection(extIndex);
    }
    // Parse DTDs
    this.exts[extIndex].dtds = this.getExtDtds(extIndex,this.exts[extIndex].dtdStart);
    // Get Checkum
    this.exts[extIndex].checksum = this.getExtChecksum(extIndex);
  }
}

Edid.prototype.validateHeader = function()
{
  var validHeader = new Boolean();
  if ((this.edidData[0] == 0x00) &&
        (this.edidData[1] == 0xFF) &&
        (this.edidData[2] == 0xFF) &&
        (this.edidData[3] == 0xFF) &&
        (this.edidData[4] == 0xFF) &&
        (this.edidData[5] == 0xFF) &&
        (this.edidData[6] == 0xFF) &&
        (this.edidData[7] == 0x00))
  {
    validHeader = true;
  }
  else
  {
    validHeader = false;
  }
  return validHeader;
}

Edid.prototype.getEisaId = function()
{
  var FIVE_BIT_LETTER_MASK = 0x1F;
  var EISA_ID_BYTE1 = 8;
  var EISA_ID_BYTE2 = 9;
  var EISA_LETTER1_OFF = 2
  var EISA_LETTER2_OFF = 5;
  var LETTER2_TOP_BYTES = 3;
  var LETTER2_TOP_MASK = 0x03;
  var LETTER2_BOT_MASK = 0x07;

  var firstLetter = (this.edidData[EISA_ID_BYTE1] >> EISA_LETTER1_OFF) &
                                            FIVE_BIT_LETTER_MASK;

  // Get the first two bits [2:0] of the top byte
  var secondLetterTop = this.edidData[EISA_ID_BYTE1] & LETTER2_TOP_MASK;
  // Get the last three bits [7:5] of the bottom byte
  var secondLetterBottom = (this.edidData[EISA_ID_BYTE2] >> EISA_LETTER2_OFF) &
                                            LETTER2_BOT_MASK;
  // Combine the top and bottom
  var secondLetter = (secondLetterTop << LETTER2_TOP_BYTES) | secondLetterBottom;

  var thirdLetter = this.edidData[EISA_ID_BYTE2] & FIVE_BIT_LETTER_MASK;

  return intToAscii(firstLetter)+intToAscii(secondLetter)+intToAscii(thirdLetter);
}

function intToAscii(intCode)
{
    var abc = "0ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
    return abc[intCode];
}

Edid.prototype.getProductCode = function()
{
  var PRODUCT_CODE1 = 10;
  var PRODUCT_CODE2 = 11;

   return this.edidData[PRODUCT_CODE1] << 8 |
                 this.edidData[PRODUCT_CODE2];
}


Edid.prototype.getSerialNumber = function()
{
  var SERIAL_NUMBER1 = 12;
  var SERIAL_NUMBER2 = 13;
  var SERIAL_NUMBER3 = 14;
  var SERIAL_NUMBER4 = 15;

  return  this.edidData[SERIAL_NUMBER4] << 24 |
                          this.edidData[SERIAL_NUMBER3] << 16 |
                          this.edidData[SERIAL_NUMBER2] << 8 |
                          this.edidData[SERIAL_NUMBER1];
}

Edid.prototype.getManufactureWeek = function()
{
  var MANUFACTURE_WEEK = 16;
  return this.edidData[MANUFACTURE_WEEK];
}

Edid.prototype.getManufactureYear = function()
{
  var MANUFACTURE_YEAR = 17;
  return this.edidData[MANUFACTURE_YEAR] + 1990;
}

Edid.prototype.getEdidVersion = function()
{
  var EDID_VERSION = 18;
  return this.edidData[EDID_VERSION];
}

Edid.prototype.getEdidRevision = function()
{
  var EDID_REVISION = 19;
  return this.edidData[EDID_REVISION];
}

Edid.prototype.getBasicDisplayParams = function()
{
  var bdp = new Object();

  var VIDEO_IN_PARAMS_BITMAP = 20;
  var DIGITAL_INPUT = 0x80;
  if(this.edidData[VIDEO_IN_PARAMS_BITMAP] & DIGITAL_INPUT)
  {
    var VESA_DFP_COMPATIBLE = 0x01;
    bdp.digitalInput = true;
    if(this.edidData[VIDEO_IN_PARAMS_BITMAP] & VESA_DFP_COMPATIBLE)
    {
      bdp.vesaDfpCompatible = true;
    }
    else
    {
      bdp.vesaDfpCompatible = false;
    }
  }
  else
  {
    bdp.digitalInput = false;

    var WHITE_SYNC_LVLS_OFF = 5;
    var WHITE_SYNC_LVLS_MASK = 0x03
    bdp.whiteSyncLevels =  (this.edidData[VIDEO_IN_PARAMS_BITMAP] >>
                                WHITE_SYNC_LVLS_OFF) & WHITE_SYNC_LVLS_MASK;

    var BLANK_TO_BLACK_OFF = 4;
    var BLANK_TO_BLACK_MASK = 0x01;
    bdp.blankToBlack = ((this.edidData[VIDEO_IN_PARAMS_BITMAP] >>
                                BLANK_TO_BLACK_OFF) & BLANK_TO_BLACK_MASK) ?
                                true : false;

    var SEPARATE_SYNC_OFF = 3;
    var SEPARATE_SYNC_MASK = 0x01;
    bdp.separateSyncSupported = ((this.edidData[VIDEO_IN_PARAMS_BITMAP] >>
                                SEPARATE_SYNC_OFF) & SEPARATE_SYNC_MASK) ?
                                true : false;

    var COMPOSITE_SYNC_OFF = 2;
    var COMPOSITE_SYNC_MASK = 0x01;
    bdp.compositeSyncSupported = ((this.edidData[VIDEO_IN_PARAMS_BITMAP] >>
                                COMPOSITE_SYNC_OFF) & COMPOSITE_SYNC_MASK) ?
                                true : false;

    var SYNC_ON_GREEN_OFF = 1;
    var SYNC_ON_GREEN_MASK = 0x01;
    bdp.synOnGreen = ((this.edidData[VIDEO_IN_PARAMS_BITMAP] >>
                                SYNC_ON_GREEN_OFF) & SYNC_ON_GREEN_MASK) ?
                                true : false;

    var VSYNC_SERRATED_MASK = 0x01;
    bdp.vsyncSerrated = (this.edidData[VIDEO_IN_PARAMS_BITMAP] & VSYNC_SERRATED_MASK) ?
                                true : false;
  }
  var MAX_HOR_IMG_SIZE = 21;
  bdp.maxHorImgSize = this.edidData[MAX_HOR_IMG_SIZE];

  var MAX_VERT_IMG_SIZE = 22;
  bdp.maxVertImgSize = this.edidData[MAX_VERT_IMG_SIZE];

  var DISPLAY_GAMMA = 23;
  bdp.displayGamma = (this.edidData[DISPLAY_GAMMA] * (2.54/255)) + 1;

  var SUPPORTED_FEATURES_BITMAP = 24;
  var DPMS_STANDBY = 0x80;
  bdp.dpmsStandby = (this.edidData[SUPPORTED_FEATURES_BITMAP] & DPMS_STANDBY) ?
                                true : false;
  var DPMS_SUSPEND = 0x40;
  bdp.dpmsSuspend = (this.edidData[SUPPORTED_FEATURES_BITMAP] & DPMS_SUSPEND) ?
                                true : false;
  var DPMS_ACTIVE_OFF = 0x20;
  bdp.dpmsActiveOff = (this.edidData[SUPPORTED_FEATURES_BITMAP] & DPMS_ACTIVE_OFF) ?
                                true : false;
  var DISPLAY_TYPE_OFF = 3;
  var DISPLAY_TYPE_MASK = 0x03;
  bdp.displayType = (this.edidData[SUPPORTED_FEATURES_BITMAP] >> DISPLAY_TYPE_OFF) &
                                   DISPLAY_TYPE_MASK;

  var STANDARD_SRGB = 0x04;
  bdp.standardSRgb = (this.edidData[SUPPORTED_FEATURES_BITMAP] & STANDARD_SRGB) ?
                                true : false;
  var PREFERRED_TIMING = 0x02;
  bdp.preferredTiming = (this.edidData[SUPPORTED_FEATURES_BITMAP] & PREFERRED_TIMING) ?
                                true : false;
  var GTF_SUPPORTED = 0x01;
  bdp.gtfSupported = (this.edidData[SUPPORTED_FEATURES_BITMAP] & GTF_SUPPORTED) ?
                                true : false;
  return bdp;
}

Edid.prototype.getChromaticityCoordinates = function()
{
  var chromaticity = new Object();
  var TWO_BIT_MASK = 0x03;
  var TWO_BIT_OFF = 2;
  var FOUR_BIT_OFF = 4;
  var SIX_BIT_OFF = 6;

  var RED_GREEN_LSB = 25;
  var RED_X_MSB = 27;
  chromaticity.redX = (this.edidData[RED_X_MSB] << TWO_BIT_OFF) |
                      ((this.edidData[RED_GREEN_LSB] >> SIX_BIT_OFF) & TWO_BIT_MASK);
  chromaticity.redXCoords = (chromaticity.redX / 1024);

  var RED_Y_MSB = 28;
  chromaticity.redY = (this.edidData[RED_Y_MSB] << TWO_BIT_OFF) |
                      ((this.edidData[RED_GREEN_LSB] >> FOUR_BIT_OFF) & TWO_BIT_MASK);
  chromaticity.redYCoords = (chromaticity.redY / 1024);

  var GREEN_X_MSB = 29;
  chromaticity.greenX = (this.edidData[GREEN_X_MSB] << TWO_BIT_OFF) |
                      ((this.edidData[RED_GREEN_LSB] >> TWO_BIT_OFF) & TWO_BIT_MASK);
  chromaticity.greenXCoords = (chromaticity.greenX / 1024);

  var GREEN_Y_MSB = 30;
  chromaticity.greenY = (this.edidData[GREEN_Y_MSB] << TWO_BIT_OFF) |
                      (this.edidData[RED_GREEN_LSB] & TWO_BIT_MASK);
  chromaticity.greenYCoords = (chromaticity.greenY / 1024);

  var BLUE_WHITE_LSB = 26;
  var BLUE_X_MSB = 31;
  chromaticity.blueX = (this.edidData[BLUE_X_MSB] << TWO_BIT_OFF) |
                      ((this.edidData[BLUE_WHITE_LSB] >> SIX_BIT_OFF) & TWO_BIT_MASK);
  chromaticity.blueXCoords = (chromaticity.blueX / 1024);

  var BLUE_Y_MSB = 32;
  chromaticity.blueY = (this.edidData[BLUE_Y_MSB] << TWO_BIT_OFF) |
                      ((this.edidData[BLUE_WHITE_LSB] >> FOUR_BIT_OFF) & TWO_BIT_MASK);
  chromaticity.blueYCoords = (chromaticity.blueY / 1024);

  var WHITE_X_MSB = 33;
  chromaticity.whiteX = (this.edidData[WHITE_X_MSB] << TWO_BIT_OFF) |
                      ((this.edidData[BLUE_WHITE_LSB] >> TWO_BIT_OFF) & TWO_BIT_MASK);
  chromaticity.whiteXCoords = (chromaticity.whiteX / 1024);

  var WHITE_Y_MSB = 34;
  chromaticity.whiteY = (this.edidData[WHITE_Y_MSB] << TWO_BIT_OFF) |
                      (this.edidData[BLUE_WHITE_LSB] & TWO_BIT_MASK);
  chromaticity.whiteYCoords = (chromaticity.whiteY / 1024);

  return chromaticity;
}

Edid.prototype.getTimingBitmap = function()
{
  var TIMING_BITMAP1 = 35;
  var TIMING_BITMAP2 = 36;
  var TIMING_BITMAP3 = 37;

  var timingBitmap = (this.edidData[TIMING_BITMAP1] << 16) |
                      (this.edidData[TIMING_BITMAP2] << 8) |
                      this.edidData[TIMING_BITMAP3];
  return timingBitmap;
}

Edid.prototype.getStandardDisplayModes = function()
{
  var STD_DISPLAY_MODES_START = 38;
  var STD_DISPLAY_MODES_END = 53;

  var stdDispModesArray = new Array();
  var arrayCounter = 0;
  var index = STD_DISPLAY_MODES_START;
  while(index < STD_DISPLAY_MODES_END)
  {
    if((this.edidData[index] != 0x01) &&
          (this.edidData[index+1] != 0x01))
    {
      var standardDisplayModes = new Object();
      standardDisplayModes.xResolution = (this.edidData[index] + 31) * 8;

      var XY_PIXEL_RATIO_OFF = 6;
      var XY_PIXEL_RATIO_MASK = 0x03;
      standardDisplayModes.xyPixelRatio = (this.edidData[index+1] >>
                                        XY_PIXEL_RATIO_OFF) & XY_PIXEL_RATIO_MASK;

      var VERTICAL_FREQUENCY_MASK = 0x3F;
      standardDisplayModes.vertFreq = (this.edidData[index+1] &
                                        VERTICAL_FREQUENCY_MASK) + 60;

      stdDispModesArray[arrayCounter] = standardDisplayModes;
      arrayCounter++;
    }
    index += 2;
  }
  return stdDispModesArray;
}

Edid.prototype.parseDtd = function(dtdIndex)
{
    var dtd = new Object();

    // Pixel Clock in MHz
    dtd.pixelClock = ((this.edidData[dtdIndex+1] << 8) |
                           this.edidData[dtdIndex]) / 100;

    var HOR_ACTIVE_OFF = 4;
    var HOR_ACTIVE_PIX_MASK = 0x0F;
    dtd.horActivePixels = (((this.edidData[dtdIndex+4] >> HOR_ACTIVE_OFF) & HOR_ACTIVE_PIX_MASK) << 8) |
                                this.edidData[dtdIndex+2];

    var HOR_BLANK_MASK = 0x0F
    dtd.horBlankPixels = (((this.edidData[dtdIndex+4])
                             & HOR_BLANK_MASK) << 8) | this.edidData[dtdIndex+3];

    var VERT_ACTIVE_OFF = 4;
    var VERT_ACTIVE_MASK = 0x0F;
    dtd.vertActivePixels = (((this.edidData[dtdIndex+7] >> VERT_ACTIVE_OFF) &
                                     VERT_ACTIVE_MASK) << 8) | this.edidData[dtdIndex+5];;
    var VERT_BLANK_MASK = 0x0F;
    dtd.vertBlankPixels = ((this.edidData[dtdIndex+7] & VERT_BLANK_MASK)  << 8)
                                                       | this.edidData[dtdIndex+6];

    var HOR_SYNC_OFF_OFF = 6;
    var HOR_SYNC_OFF_MASK = 0x03;
    dtd.horSyncOff = (((this.edidData[dtdIndex+11] >> HOR_SYNC_OFF_OFF)
                             & HOR_SYNC_OFF_MASK) << 8) | this.edidData[dtdIndex+8];

    var HOR_SYNC_PULSE_OFF = 4;
    var HOR_SYNC_PULSE_MASK = 0x03;
    dtd.horSyncPulse = (((this.edidData[dtdIndex+11] >> HOR_SYNC_PULSE_OFF)
                             & HOR_SYNC_PULSE_MASK) << 8)| this.edidData[dtdIndex+9];

    var VERT_SYNC_OFF_TOP_OFF = 2;
    var VERT_SYNC_OFF_TOP_MASK = 0x03;
    var VERT_SYNC_OFF_BOT_OFF = 4;
    var VERT_SYNC_OFF_BOT_MASK = 0x0F;
    dtd.vertSyncOff = (((this.edidData[dtdIndex+11] >> VERT_SYNC_OFF_TOP_OFF)
                             & VERT_SYNC_OFF_TOP_MASK) << 4) |
                      ((this.edidData[dtdIndex+10] >> VERT_SYNC_OFF_BOT_OFF) &
                      VERT_SYNC_OFF_BOT_MASK);

    var VERT_SYNC_PULSE_TOP_MASK = 0x03;
    var VERT_SYNC_PULSE_BOT_MASK = 0x0F;
    dtd.vertSyncPulse = ((this.edidData[dtdIndex+11] & VERT_SYNC_PULSE_TOP_MASK)
                          << 4) | (this.edidData[dtdIndex+10] & VERT_SYNC_PULSE_BOT_MASK);

    var HOR_DISPLAY_TOP_OFF = 4;
    var HOR_DISPLAY_TOP_MASK = 0x0F;
    dtd.horDisplaySize = (((this.edidData[dtdIndex+14] >> HOR_DISPLAY_TOP_OFF)
                             & HOR_DISPLAY_TOP_MASK) << 8) | this.edidData[dtdIndex+12];

    var VERT_DISPLAY_TOP_MASK = 0x0F;
    dtd.vertDisplaySize = ((this.edidData[dtdIndex+14] & VERT_DISPLAY_TOP_MASK) << 8)
                                               | this.edidData[dtdIndex+13];

    dtd.horBorderPixels = this.edidData[dtdIndex+15];

    dtd.vertBorderLines = this.edidData[dtdIndex+16];

    var INTERLACED_MASK = 0x80;
    dtd.interlaced = (this.edidData[dtdIndex+17] & INTERLACED_MASK) ? true : false;

    var STEREO_MODE_OFFSET = 5;
    var STEREO_MODE_MASK = 0x03;
    dtd.stereoMode = ((this.edidData[dtdIndex+17] >> STEREO_MODE_OFFSET) &
                                                     STEREO_MODE_MASK);


    var SYNC_TYPE_OFFSET = 3;
    var SYNC_TYPE_MASK = 0x03;
    dtd.syncType = ((this.edidData[dtdIndex+17] >> SYNC_TYPE_OFFSET) &
                                                     SYNC_TYPE_MASK);
    // Bit is dependent on sync type
    if(dtd.syncType == this.syncTypeEnum.DIGITAL_SEPARATE)
    {
      var VSYNC_POLARITY_MASK = 0x04;
      dtd.vSyncPolarity = (this.edidData[dtdIndex+17] &
                              VSYNC_POLARITY_MASK) ? true : false;
    }
    else
    {
      var VSYNC_SERRATED_MASK = 0x04;
      dtd.vSyncSerrated = (this.edidData[dtdIndex+17] &
                              VSYNC_SERRATED_MASK) ? true : false;
    }

    // Bit is dependent on syn type
    if((dtd.syncType == this.syncTypeEnum.ANALOG_COMPOSITE) ||
                     (dtd.syncType == this.syncTypeEnum.BIPOLAR_ANALOG_COMPOSITE))
    {
      var SYNC_ALL_RGB_MASK = 0x02;
      dtd.syncAllRGBLines = (this.edidData[dtdIndex+17] &
                              SYNC_ALL_RGB_MASK) ? true : false;
    }
    else
    {
      var HSYNC_POLARY_MASK = 0x02;
      dtd.hSyncPolarity = (this.edidData[dtdIndex+17] &
                              HSYNC_POLARY_MASK) ? true : false;
    }
    var TWO_WAY_STEREO_MASK = 0x01;
    dtd.twoWayStereo = (this.edidData[dtdIndex+17] & TWO_WAY_STEREO_MASK) ? true : false;

  return dtd;
}

Edid.prototype.getDtds = function()
{
  var dtdArray = new Array();
  var dtdCounter = 0;

  var DTD_START = 54;
  var DTD_END = 125;

  var dtdIndex = DTD_START;

  // While the pixel clock is not equal to zero and
  // the DTD index is less than the last byte of the DTD
  while(((this.edidData[dtdIndex] != 0) || (this.edidData[dtdIndex+1] != 0))
                                && (dtdIndex < DTD_END))
  {
    var dtd = this.parseDtd(dtdIndex);
    // Add DTD to the DTD Array
    dtdArray[dtdCounter] = dtd;
    // Increment DTD Counter
    dtdCounter++;
    // Add a DTD length, to go to the next descriptor
    dtdIndex += this.DTD_LENGTH;
  }
  return dtdArray;
}

Edid.prototype.getNumberExtensions = function()
{
  var NUMBER_OF_EXTENSIONS = 126;
  return this.edidData[NUMBER_OF_EXTENSIONS];
}

Edid.prototype.getChecksum = function()
{
  var CHECKSUM = 127;
  return this.edidData[CHECKSUM];
}

Edid.prototype.calcChecksum = function(block)
{
  var startAddress = block * this.EDID_BLOCK_LENGTH;
  var endAddress = startAddress + this.EDID_BLOCK_LENGTH - 1;
  var checksum = 0;
  for(var index = startAddress; index < endAddress; index++)
  {
    checksum += this.edidData[index];
  }
  return (256- (checksum % 256));
}

Edid.prototype.validChecksum = function(block)
{
  var checksum = this.edidData[((block+1) * this.EDID_BLOCK_LENGTH) - 1];
  var calculatedChecksum = this.calcChecksum(block);
  var validChecksum =  new Boolean();

  if(checksum == calculatedChecksum)
  {
    validChecksum = true;
  }
  else
  {
    validChecksum = false;
  }
  return validChecksum;
}

Edid.prototype.getExtTag = function(extIndex)
{
  var BLOCK_OFFSET = this.EDID_BLOCK_LENGTH * (extIndex+1);
  var EXT_TAG = BLOCK_OFFSET + 0;
  return this.edidData[EXT_TAG];
}

Edid.prototype.getRevisionNumber = function(extIndex)
{
  var BLOCK_OFFSET = this.EDID_BLOCK_LENGTH * (extIndex+1);
  var REV_NUMBER = BLOCK_OFFSET + 1;
  return this.edidData[REV_NUMBER];
}

Edid.prototype.getDtdStart = function(extIndex)
{
  var BLOCK_OFFSET = this.EDID_BLOCK_LENGTH * (extIndex+1);
  var DTD_START = BLOCK_OFFSET + 2;
  return this.edidData[DTD_START];
}

Edid.prototype.getNumberExtDtds = function(extIndex)
{
  var BLOCK_OFFSET = this.EDID_BLOCK_LENGTH * (extIndex+1);
  var NUM_DTDS = BLOCK_OFFSET + 3;
  var NUM_DTDS_MASK = 0x0F;
  return (this.edidData[NUM_DTDS] & NUM_DTDS_MASK);
}

Edid.prototype.getUnderscan = function(extIndex)
{
  var BLOCK_OFFSET = this.EDID_BLOCK_LENGTH * (extIndex+1);
  var UNDERSCAN = BLOCK_OFFSET + 3;
  var UNDERSCAN_MASK = 0x80;
  return (this.edidData[UNDERSCAN] & UNDERSCAN_MASK)?true:false;
}

Edid.prototype.getBasicAudio = function(extIndex)
{
  var BLOCK_OFFSET = this.EDID_BLOCK_LENGTH * (extIndex+1);
  var BASIC_AUDIO = BLOCK_OFFSET + 3;
  var BASIC_AUDIO_MASK = 0x40;
  return (this.edidData[BASIC_AUDIO] & BASIC_AUDIO_MASK)?true:false;
}

Edid.prototype.getYcBcR444 = function(extIndex)
{
  var BLOCK_OFFSET = this.EDID_BLOCK_LENGTH * (extIndex+1);
  var YCBCR_444 = BLOCK_OFFSET + 3;
  var YCBCR_444_MASK = 0x20;
  return (this.edidData[YCBCR_444] & YCBCR_444_MASK)?true:false;
}

Edid.prototype.getYcBcR422 = function(extIndex)
{
  var BLOCK_OFFSET = this.EDID_BLOCK_LENGTH * (extIndex+1);
  var YCBCR_422 = BLOCK_OFFSET + 3;
  var YCBCR_422_MASK = 0x10;
  return (this.edidData[YCBCR_422] & YCBCR_422_MASK)?true:false;
}

Edid.prototype.parseDataBlockCollection = function(extIndex)
{
  var BLOCK_OFFSET = this.EDID_BLOCK_LENGTH * (extIndex+1);
  var START_DATA_BLOCK = 4;
  var startAddress = BLOCK_OFFSET + START_DATA_BLOCK;
  var dataBlockLength = this.exts[extIndex].dtdStart - START_DATA_BLOCK;
  var endAddress = startAddress + dataBlockLength;
  var dataBlockCollection = new Array();

  var TAG_CODE_MASK = 0x07;
  var TAG_CODE_OFFSET = 5;
  var DATA_BLOCK_LENGTH_MASK = 0x1F;
  var index = startAddress;
  var numberDataBlocks = 0;
  while(index < endAddress)
  {
    // Parse tag code
    var blockTagCode = (this.edidData[index] >> TAG_CODE_OFFSET) & TAG_CODE_MASK;
    // Parse Length
    var blockLength = (this.edidData[index] & DATA_BLOCK_LENGTH_MASK);

    // Object that holds Parsed Data block
    var dataBlock;

    // Parse the data block by the tag code
    if(blockTagCode == this.dataBlockType.AUDIO.value)
    {
      dataBlock = this.parseAudioDataBlock(index+1,blockLength);
    }
    else if(blockTagCode == this.dataBlockType.VIDEO.value)
    {
      dataBlock = this.parseVideoDataBlock(index+1,blockLength);
    }
    else if(blockTagCode == this.dataBlockType.VENDOR_SPECIFIC.value)
    {
      dataBlock = this.parseVendorDataBlock(index+1,blockLength);
    }
    else if(blockTagCode == this.dataBlockType.SPEAKER_ALLOCATION.value)
    {
      dataBlock = this.parseSpeakerDataBlock(index+1,blockLength);
    }

    // Add the new object to the data block collection
    dataBlockCollection[numberDataBlocks] = dataBlock;
    // Increment the Index, to the location of the next block
    index += (blockLength + 1);
    // Increment the number of data blocks
    numberDataBlocks++;
  }
  return dataBlockCollection;
}

Edid.prototype.parseAudioDataBlock = function(startAddress, blockLength)
{
  var audioBlock = new Array();
  // Audio blocks are made up of Short Audio Descriptors that are three bytes each
  var SHORT_AUDIO_DESC_LENGTH = 3;
  // The number of Short Audio Descriptors is the block length divided by the descriptor size
  var numberShortAudioDescriptors = blockLength / SHORT_AUDIO_DESC_LENGTH;
  var shortAudDescIndex = 0;
  var index = startAddress;

  // Set the Audio Block Tag
  audioBlock.tag = this.dataBlockType.AUDIO;
  // Set the Audio block length
  audioBlock.dataLength = blockLength;
  // Set the number of short audio descriptors
  audioBlock.length = numberShortAudioDescriptors;
  // Create array for short audio descriptors
  audioBlock.shortAudioDescriptors = new Array();


  // Parse the short audio descriptors in the Audio Data Block
  var SHORT_AUDIO_DESC_MASK = 0x0F;
  var SHORT_AUDIO_DESC_OFF = 3;
  var MAX_CHANNELS_MASK = 0x07;
  var SAMPLE_RATE_MASK = 0x7F;
  while(shortAudDescIndex < numberShortAudioDescriptors)
  {
    // Each Short Audio Descriptor is a 3 byte object
    var shortAudDesc = new Object();

    // Parse the format
    shortAudDesc.format = (this.edidData[index] >> SHORT_AUDIO_DESC_OFF) & SHORT_AUDIO_DESC_MASK;
    // Parse max number of channels
    shortAudDesc.maxChannels = (this.edidData[index] & MAX_CHANNELS_MASK) + 1;
    // Parse audio sample rates
    shortAudDesc.sampleRates = this.edidData[index+1] & SAMPLE_RATE_MASK;

    if(shortAudDesc.format <= this.audioFormatArray[0])
    {
      var BIT_DEPTH_MASK = 0x07;
      shortAudDesc.bitDepth = this.edidData[index+2] & BIT_DEPTH_MASK;
    }
    else if(shortAudDesc.format <= this.audioFormatArray[1])
    {
      var MAX_BIT_RATE_MASK = 0xFF;
      shortAudDesc.bitRate = (this.edidData[index+2] & MAX_BIT_RATE_MASK) * 8;
    }
    else if(shortAudDesc.format <= this.audioFormatArray[2])
    {
      var AUDIO_FORMAT_CODE_MASK = 0xFF;
      shortAudDesc.audioFormatCode = this.edidData[index+2] & AUDIO_FORMAT_CODE_MASK;
    }
    else if(shortAudDesc.format <= this.audioFormatArray[3])
    {
      var PROFILE_MASK = 0x07;
      shortAudDesc.profile = this.edidData[index+2] & PROFILE_MASK;
    }
    else if(shortAudDesc.format <= this.audioFormatArray[4])
    {
      var FORMAT_CODE_EXT_OFF = 3;
      var FORMAT_CODE_EXT_MASK = 0x1F;
      shortAudDesc.formatCodeExt = (this.edidData[index+2] >> FORMAT_CODE_EXT_OFF) & FORMAT_CODE_EXT_MASK;
    }

    // Add Short Audio Descriptor to Audio Data Block
    audioBlock.shortAudioDescriptors[shortAudDescIndex] = shortAudDesc;
    // Move the index to the beginning of the next Short Audio Descriptor
    index += SHORT_AUDIO_DESC_LENGTH;
    // Increment the count to the next Short Audio Descriptor
    shortAudDescIndex++;
  }

  return audioBlock;
}

Edid.prototype.parseVideoDataBlock = function(startAddress, blockLength)
{
  var videoBlock = new Object();
  videoBlock.tag = this.dataBlockType.VIDEO;
  videoBlock.length = blockLength;

  var index = 0;
  videoBlock.shortVideoDescriptors = new Array();

  var VIC_MASK = 0x7F;
  var NATIVE_RESOLUTION_MASK = 0x80;
  while(index < blockLength)
  {
    shortVideoDescriptor = new Object;
    shortVideoDescriptor.vic = this.edidData[startAddress+index] & VIC_MASK;
    shortVideoDescriptor.nativeResolution = (this.edidData[startAddress+index] &
                                              NATIVE_RESOLUTION_MASK)?true:false;

    videoBlock.shortVideoDescriptors[index] = shortVideoDescriptor;

    index++;
  }

  return videoBlock;
}

Edid.prototype.parseVendorDataBlock = function(startAddress, blockLength)
{
  var vendorBlock = new Object();
  vendorBlock.tag = this.dataBlockType.VENDOR_SPECIFIC;
  vendorBlock.length = blockLength;

  // Subtract one, so the indexing matches the HDMI Specification
  vsdbAddress = startAddress - 1;

  var IEEE_REG_IDENTIFIER_1 = 1;
  var IEEE_REG_IDENTIFIER_2 = 2;
  var IEEE_REG_IDENTIFIER_3 = 3;
  // 24-bit IEEE Registration Identifier
  vendorBlock.ieeeIdentifier = (this.edidData[vsdbAddress+IEEE_REG_IDENTIFIER_3] << 16) |
                      (this.edidData[vsdbAddress+IEEE_REG_IDENTIFIER_2] << 8) |
                      (this.edidData[vsdbAddress+IEEE_REG_IDENTIFIER_1]);

  var PHYSICAL_ADDRESS_1 = 4;
  var PHYSICAL_ADDRESS_2 = 5;
  // Physical Address
  vendorBlock.physicalAddress = (this.edidData[vsdbAddress+PHYSICAL_ADDRESS_1] << 8) |
                      (this.edidData[vsdbAddress+PHYSICAL_ADDRESS_2]);

  var AI_DC_DUAL_ADDRESS = 6;
  if(blockLength >= AI_DC_DUAL_ADDRESS)
  {
    var SUPPORT_AI_MASK = 0x80;
    // Parse Supports ACP, ISRC1, ISRC2
    vendorBlock.supportsAI = (this.edidData[vsdbAddress+AI_DC_DUAL_ADDRESS] & SUPPORT_AI_MASK)
                              ?true:false;

    var DEEP_COLOR_48_MASK = 0x40;
    vendorBlock.deepColor48 = (this.edidData[vsdbAddress+AI_DC_DUAL_ADDRESS] & DEEP_COLOR_48_MASK)
                              ?true:false;
    var DEEP_COLOR_36_MASK = 0x20;
    vendorBlock.deepColor36 = (this.edidData[vsdbAddress+AI_DC_DUAL_ADDRESS] & DEEP_COLOR_36_MASK)
                              ?true:false;
    var DEEP_COLOR_30_MASK = 0x10;
    vendorBlock.deepColor30 = (this.edidData[vsdbAddress+AI_DC_DUAL_ADDRESS] & DEEP_COLOR_30_MASK)
                              ?true:false;
    var DEEP_COLOR_Y444_MASK = 0x08;
    vendorBlock.deepColorY444 = (this.edidData[vsdbAddress+AI_DC_DUAL_ADDRESS] & DEEP_COLOR_Y444_MASK)
                              ?true:false;
    var DUAL_DVI_MASK = 0x01;
    vendorBlock.dualDvi = (this.edidData[vsdbAddress+AI_DC_DUAL_ADDRESS] & DUAL_DVI_MASK)
                              ?true:false;
  }

  var MAX_TMDS_CLOCK_ADDRESS = 7;
  if(blockLength >= MAX_TMDS_CLOCK_ADDRESS)
  {
    // Parse Max TMDS rate, the edid has TMDS clock. Multiply TMDS clock x 5Mhz
    // and you'll get max TMDS rate
    vendorBlock.maxTmdsRate = this.edidData[vsdbAddress+MAX_TMDS_CLOCK_ADDRESS] * 5;
  }

  var LATENCY_PRESENT_ADDRESS = 8;
  if(blockLength >= LATENCY_PRESENT_ADDRESS)
  {
    var LATENCY_FIELDS_PRESENT_MASK = 0x80;
    vendorBlock.latencyPresent = (this.edidData[vsdbAddress+LATENCY_PRESENT_ADDRESS] & LATENCY_FIELDS_PRESENT_MASK)
                                        ?true:false;

    var I_LATENCY_FIELDS_PRESENT_MASK = 0x80;
    vendorBlock.iLatencyPresent = (this.edidData[vsdbAddress+LATENCY_PRESENT_ADDRESS] & I_LATENCY_FIELDS_PRESENT_MASK)
                                        ?true:false;
  }

  // If Latency fields are present
  if(vendorBlock.latencyPresent && (blockLength >= AUDIO_LATENCY_ADDRESS))
  {
    var VIDEO_LATENCY_ADDRESS = 9;
    // TODO: Add description
    vendorBlock.videoLatency = ((this.edidData[vsdbAddress+VIDEO_LATENCY_ADDRESS] - 1)
                                  *2);

    var AUDIO_LATENCY_ADDRESS = 10;
    // TODO: Add description
    vendorBlock.audioLatency = ((this.edidData[vsdbAddress+AUDIO_LATENCY_ADDRESS] - 1)
                                  *2);
  }

  // If Interlaced Latency fields are present
  if(vendorBlock.iLatencyPresent && (blockLength >= I_AUDIO_LATENCY_ADDRESS))
  {
    var I_VIDEO_LATENCY_ADDRESS = 11;
    // TODO: Add description
    vendorBlock.iVideoLatency = ((this.edidData[vsdbAddress+I_VIDEO_LATENCY_ADDRESS] - 1)
                                  *2);

    var I_AUDIO_LATENCY_ADDRESS = 12;
    // TODO: Add description
    vendorBlock.iAudioLatency = ((this.edidData[vsdbAddress+I_AUDIO_LATENCY_ADDRESS] - 1)
                                  *2);
  }

  return vendorBlock;
}

Edid.prototype.parseSpeakerDataBlock = function(startAddress, blockLength)
{
  var speakerBlock = new Object();
  speakerBlock.tag = this.dataBlockType.SPEAKER_ALLOCATION;
  speakerBlock.length = blockLength;

  speakerBlock.payload = (this.edidData[startAddress+2] << 16) |
                          (this.edidData[startAddress+1] << 8) |
                          (this.edidData[startAddress]);

  return speakerBlock;
}

Edid.prototype.getExtChecksum = function(extIndex)
{
  var BLOCK_OFFSET = this.EDID_BLOCK_LENGTH * (extIndex+1);
  var CHECKSUM_OFFSET = 127;

  return this.edidData[BLOCK_OFFSET+CHECKSUM_OFFSET];
}

Edid.prototype.getExtDtds = function(extIndex,startAddress)
{
  var BLOCK_OFFSET = this.EDID_BLOCK_LENGTH * (extIndex+1);
  var dtdArray = new Array();
  var dtdCounter = 0;
  var dtdIndex = startAddress + BLOCK_OFFSET;
  var endAddress = (this.EDID_BLOCK_LENGTH * (extIndex+2)) - 2;

  while(((this.edidData[dtdIndex] != 0) || (this.edidData[dtdIndex+1] != 0))
                                && (dtdIndex < endAddress))
  {
    var dtd = this.parseDtd(dtdIndex);
    // Add DTD to the DTD Array
    dtdArray[dtdCounter] = dtd;
    // Increment DTD Counter
    dtdCounter++;
    // Add a DTD length, to go to the next descriptor
    dtdIndex += this.DTD_LENGTH;
  }
  return dtdArray;
}

module.exports = Edid;
