// Database of pins
// pinIndex is an array whose elements describe each pin.  The order is
//    USR LEDs, P8 header pins, then P9 header
// pins is an object whose keys are the pinIndex keys, e.g. P9_14.
// uarts and i2c are objects describing the serial ports and i2c buses.



var pinIndex = [{
        "name": "USR0",
        "gpio": 53,
        "led": "beaglebone:green:usr0",
        "mux": "gpmc_a5",
        "key": "USR0",
        "muxRegOffset": "0x054",
        "options": [
            "gpmc_a5",
            "gmii2_txd0",
            "rgmii2_td0",
            "rmii2_txd0",
            "gpmc_a21",
            "pr1_mii1_rxd3",
            "eqep1b_in",
            "gpio1_21"
        ],
        "ball": {
            "ZCZ": "V15",
            "BSM": "P13"
        }
    },
    {
        "name": "USR1",
        "gpio": 54,
        "led": "beaglebone:green:usr1",
        "mux": "gpmc_a6",
        "key": "USR1",
        "muxRegOffset": "0x058",
        "options": [
            "gpmc_a6",
            "gmii2_txclk",
            "rgmii2_tclk",
            "mmc2_dat4",
            "gpmc_a22",
            "pr1_mii1_rxd2",
            "eqep1_index",
            "gpio1_22"
        ],
        "ball": {
            "ZCZ": "U15",
            "BSM": "T14"
        }
    },
    {
        "name": "USR2",
        "gpio": 55,
        "led": "beaglebone:green:usr2",
        "mux": "gpmc_a7",
        "key": "USR2",
        "muxRegOffset": "0x05c",
        "options": [
            "gpmc_a7",
            "gmii2_rxclk",
            "rgmii2_rclk",
            "mmc2_dat5",
            "gpmc_a23",
            "pr1_mii1_rxd1",
            "eqep1_strobe",
            "gpio1_23"
        ],
        "ball": {
            "ZCZ": "T15",
            "BSM": "R14"
        }
    },
    {
        "name": "USR3",
        "gpio": 56,
        "led": "beaglebone:green:usr3",
        "mux": "gpmc_a8",
        "key": "USR3",
        "muxRegOffset": "0x060",
        "options": [
            "gpmc_a8",
            "gmii2_rxd3",
            "rgmii2_rd3",
            "mmc2_dat6",
            "gpmc_a24",
            "pr1_mii1_rxd0",
            "mcasp0_aclkx",
            "gpio1_24"
        ],
        "ball": {
            "ZCZ": "V16",
            "BSM": "P14"
        }
    },
    {
        "name": "DGND",
        "key": ["P8_1", "P8_2", "P9_1", "P9_2", "P9_43", "P9_44", "P9_45", "P9_46",
            "P1_15", "P1_16", "P1_22", "P2_15", "P2_21",
            "E1_1", "E2_1", "E3_1", "E4_1", "S1_1_1", "S1_2_1", "UT0_1", "UT1_1", "UT5_1",
            "DSM2_2", "I2C_1", "GPS_2", "GPS_6", "GP0_1", "GP1_1"
        ]
    },
    {
        "name": "GPIO1_6",
        "gpio": 38,
        "mux": "gpmc_ad6",
        "eeprom": 26,
        "key": "P8_3",
        "universalName": ["ocp:P8_03_pinmux"],
        "muxRegOffset": "0x018",
        "options": [
            "gpmc_ad6",
            "mmc1_dat6",
            "NA",
            "NA",
            "NA",
            "NA",
            "NA",
            "gpio1_6"
        ],
        "ball": {
            "ZCZ": "R9",
            "BSM": "P4"
        }
    },
    {
        "name": "GPIO1_7",
        "gpio": 39,
        "mux": "gpmc_ad7",
        "eeprom": 27,
        "key": "P8_4",
        "universalName": ["ocp:P8_04_pinmux"],
        "muxRegOffset": "0x01c",
        "options": [
            "gpmc_ad7",
            "mmc1_dat7",
            "NA",
            "NA",
            "NA",
            "NA",
            "NA",
            "gpio1_7"
        ],
        "ball": {
            "ZCZ": "T9",
            "BSM": "R4"
        }
    },
    {
        "name": "GPIO1_2",
        "gpio": 34,
        "mux": "gpmc_ad2",
        "eeprom": 22,
        "key": "P8_5",
        "universalName": ["ocp:P8_05_pinmux"],
        "muxRegOffset": "0x008",
        "options": [
            "gpmc_ad2",
            "mmc1_dat2",
            "NA",
            "NA",
            "NA",
            "NA",
            "NA",
            "gpio1_2"
        ],
        "ball": {
            "ZCZ": "R8",
            "BSM": "R1"
        }
    },
    {
        "name": "GPIO1_3",
        "gpio": 35,
        "mux": "gpmc_ad3",
        "eeprom": 23,
        "key": "P8_6",
        "universalName": ["ocp:P8_06_pinmux"],
        "muxRegOffset": "0x00c",
        "options": [
            "gpmc_ad3",
            "mmc1_dat3",
            "NA",
            "NA",
            "NA",
            "NA",
            "NA",
            "gpio1_3"
        ],
        "ball": {
            "ZCZ": "T8",
            "BSM": "T3"
        }
    },
    {
        "name": "TIMER4",
        "gpio": 66,
        "mux": "gpmc_advn_ale",
        "eeprom": 41,
        "key": ["P8_7", "RED", "GP1_5"],
        "led": [null, "red", "red"],
        "universalName": ["ocp:P8_07_pinmux"],
        "muxRegOffset": "0x090",
        "options": [
            "gpmc_advn_ale",
            "NA",
            "timer4",
            "NA",
            "NA",
            "NA",
            "NA",
            "gpio2_2"
        ],
        "ball": {
            "ZCZ": "R7",
            "BSM": "M1"
        }
    },
    {
        "name": "TIMER7",
        "gpio": 67,
        "mux": "gpmc_oen_ren",
        "eeprom": 44,
        "key": ["P8_8", "GREEN", "GP1_6"],
        "led": [null, "green", "green"],
        "universalName": ["ocp:P8_08_pinmux"],
        "muxRegOffset": "0x094",
        "options": [
            "gpmc_oen_ren",
            "NA",
            "timer7",
            "NA",
            "NA",
            "NA",
            "NA",
            "gpio2_3"
        ],
        "ball": {
            "ZCZ": "T7",
            "BSM": "N1"
        }
    },
    {
        "name": "TIMER5",
        "gpio": 69,
        "mux": "gpmc_ben0_cle",
        "eeprom": 42,
        "key": ["P8_9", "PAUSE"],
        "universalName": ["ocp:P8_09_pinmux"],
        "muxRegOffset": "0x09c",
        "options": [
            "gpmc_ben0_cle",
            "NA",
            "timer5",
            "NA",
            "NA",
            "NA",
            "NA",
            "gpio2_5"
        ],
        "ball": {
            "ZCZ": "T6",
            "BSM": "N3"
        }
    },
    {
        "name": "TIMER6",
        "gpio": 68,
        "mux": "gpmc_wen",
        "eeprom": 43,
        "key": ["P8_10", "MODE"],
        "muxRegOffset": "0x098",
        "options": [
            "gpmc_wen",
            "NA",
            "timer6",
            "NA",
            "NA",
            "NA",
            "NA",
            "gpio2_4"
        ],
        "ball": {
            "ZCZ": "U6",
            "BSM": "N2"
        }
    },
    {
        "name": "GPIO1_13",
        "gpio": 45,
        "mux": "gpmc_ad13",
        "eeprom": 29,
        "key": ["P8_11", "E3_4", "P2_33"],
        "muxRegOffset": "0x034",
        "options": [
            "gpmc_ad13",
            "lcd_data18",
            "mmc1_dat5",
            "mmc2_dat1",
            "eqep2B_in",
            "pr1_mii0_txd",
            "pr1_pru0_pru_r30_15",
            "gpio1_13"
        ],
        "ball": {
            "ZCZ": "R12",
            "BSM": "R6"
        }
    },
    {
        "name": "GPIO1_12",
        "gpio": 44,
        "mux": "gpmc_ad12",
        "eeprom": 28,
        "key": ["P8_12", "E3_3", "P2_24"],
        "muxRegOffset": "0x030",
        "options": [
            "gpmc_ad12",
            "lcd_data19",
            "mmc1_dat4",
            "mmc2_dat0",
            "eqep2a_in",
            "pr1_mii0_txd2",
            "pr1_pru0_pru_r30_14",
            "gpio1_12"
        ],
        "ball": {
            "ZCZ": "T12",
            "BSM": "P6"
        }
    },
    {
        "name": "EHRPWM2B",
        "gpio": 23,
        "mux": "gpmc_ad9",
        "eeprom": 15,
        // From am335x technical manual, p.183
        // http://www.ti.com/lit/ug/spruh73n/spruh73n.pdf
        "pwm": {
            "module": "ehrpwm2",
            "sysfs": 6,
            "index": 1,
            "muxmode": 4,
            "path": "ehrpwm.2:1",
            "name": "EHRPWM2B",
            "chip": "48304000",
            "addr": "48304200"
        },
        "key": ["P8_13", "P2_3"],
        "universalName": ["ocp:P8_13_pinmux", "ocp:P2_03_pinmux"],
        "muxRegOffset": "0x024",
        "options": [
            "gpmc_ad9",
            "lcd_data22",
            "mmc1_dat1",
            "mmc2_dat5",
            "ehrpwm2B",
            "pr1_mii0_col",
            "NA",
            "gpio0_23"
        ],
        "ball": {
            "ZCZ": "T10",
            "BSM": "P5"
        }
    },
    {
        "name": "GPIO0_26",
        "gpio": 26,
        "mux": "gpmc_ad10",
        "eeprom": 16,
        "key": ["P8_14", "BAT100", "P1_34"],
        "led": [null, "bat100", null],
        "muxRegOffset": "0x028",
        "options": [
            "gpmc_ad10",
            "lcd_data21",
            "mmc1_dat2",
            "mmc2_dat6",
            "ehrpwm2_tripzone_input",
            "pr1_mii0_txen",
            "NA",
            "gpio0_26"
        ],
        "ball": {
            "ZCZ": "T11",
            "BSM": "R5"
        }
    },
    {
        "name": "GPIO1_15",
        "gpio": 47,
        "mux": "gpmc_ad15",
        "eeprom": 31,
        "key": ["P8_15", "E4_4", "P2_18"],
        "muxRegOffset": "0x03c",
        "options": [
            "gpmc_ad15",
            "lcd_data16",
            "mmc1_dat7",
            "mmc2_dat3",
            "eqep2_strobe",
            "pr1_ecap0_ecap_capin_apwm_o",
            "pr1_pru0_pru_r31_15",
            "gpio1_15"
        ],
        "ball": {
            "ZCZ": "U13",
            "BSM": "P7"
        }
    },
    {
        "name": "GPIO1_14",
        "gpio": 46,
        "mux": "gpmc_ad14",
        "eeprom": 30,
        "key": ["P8_16", "E4_3", "P2_22"],
        "muxRegOffset": "0x038",
        "options": [
            "gpmc_ad14",
            "lcd_data17",
            "mmc1_dat6",
            "mmc2_dat2",
            "eqep2_index",
            "pr1_mii0_txd0",
            "pr1_pru0_pru_r31_14",
            "gpio1_14"
        ],
        "ball": {
            "ZCZ": "V13",
            "BSM": "T6"
        }
    },
    {
        "name": "GPIO0_27",
        "gpio": 27,
        "mux": "gpmc_ad11",
        "eeprom": 17,
        "key": ["P8_17", "BAT25", "P2_19"],
        "led": [null, "bat25", null],
        "muxRegOffset": "0x02c",
        "options": [
            "gpmc_ad11",
            "lcd_data20",
            "mmc1_dat3",
            "mmc2_dat7",
            "ehrpwm0_synco",
            "pr1_mii0_txd3",
            "NA",
            "gpio0_27"
        ],
        "ball": {
            "ZCZ": "U12",
            "BSM": "T5"
        }
    },
    {
        "name": "GPIO2_1",
        "gpio": 65,
        "mux": "gpmc_clk",
        "eeprom": 40,
        "key": ["P8_18", "P2_17"],
        "muxRegOffset": "0x08c",
        "options": [
            "gpmc_clk",
            "lcd_memory_clk_mux",
            "NA",
            "mmc2_clk",
            "NA",
            "NA",
            "mcasp0_fsr",
            "gpio2_1"
        ],
        "ball": {
            "ZCZ": "V12",
            "BSM": "T7"
        }
    },
    {
        "name": "EHRPWM2A",
        "gpio": 22,
        "mux": "gpmc_ad8",
        "eeprom": 14,
        // From am335x technical manual, p.183
        // http://www.ti.com/lit/ug/spruh73n/spruh73n.pdf
        "pwm": {
            "module": "ehrpwm2",
            "sysfs": 5,
            "index": 0,
            "muxmode": 4,
            "path": "ehrpwm.2:0",
            "name": "EHRPWM2A",
            "chip": "48304000",
            "addr": "48304200"
        },
        "key": "P8_19",
        "muxRegOffset": "0x020",
        "options": [
            "gpmc_ad8",
            "lcd_data23",
            "mmc1_dat0",
            "mmc2_dat4",
            "ehrpwm2A",
            "pr1_mii_mt0_clk",
            "NA",
            "gpio0_22"
        ],
        "ball": {
            "ZCZ": "U10",
            "BSM": "T4"
        }
    },
    {
        "name": "GPIO1_31",
        "gpio": 63,
        "mux": "gpmc_csn2",
        "eeprom": 39,
        "key": "P8_20",
        "muxRegOffset": "0x084",
        "options": [
            "gpmc_csn2",
            "gpmc_be1n",
            "mmc1_cmd",
            "pr1_edio_data_in7",
            "pr1_edio_data_out7",
            "pr1_pru1_pru_r30_13",
            "pr1_pru1_pru_r31_13",
            "gpio1_31"
        ],
        "ball": {
            "ZCZ": "V9",
            "BSM": "P1"
        }
    },
    {
        "name": "GPIO1_30",
        "gpio": 62,
        "mux": "gpmc_csn1",
        "eeprom": 38,
        "key": "P8_21",
        "muxRegOffset": "0x080",
        "options": [
            "gpmc_csn1",
            "gpmc_clk",
            "mmc1_clk",
            "pr1_edio_data_in6",
            "pr1_edio_data_out6",
            "pr1_pru1_pru_r30_12",
            "pr1_pru1_pru_r31_12",
            "gpio1_30"
        ],
        "ball": {
            "ZCZ": "U9",
            "BSM": "P2"
        }
    },
    {
        "name": "GPIO1_5",
        "gpio": 37,
        "mux": "gpmc_ad5",
        "eeprom": 25,
        "key": "P8_22",
        "muxRegOffset": "0x014",
        "options": [
            "gpmc_ad5",
            "mmc1_dat5",
            "NA",
            "NA",
            "NA",
            "NA",
            "NA",
            "gpio1_5"
        ],
        "ball": {
            "ZCZ": "V8",
            "BSM": "T1"
        }
    },
    {
        "name": "GPIO1_4",
        "gpio": 36,
        "mux": "gpmc_ad4",
        "eeprom": 24,
        "key": "P8_23",
        "muxRegOffset": "0x010",
        "options": [
            "gpmc_ad4",
            "mmc1_dat4",
            "NA",
            "NA",
            "NA",
            "NA",
            "NA",
            "gpio1_4"
        ],
        "ball": {
            "ZCZ": "U8",
            "BSM": "T2"
        }
    },
    {
        "name": "GPIO1_1",
        "gpio": 33,
        "mux": "gpmc_ad1",
        "eeprom": 21,
        "key": "P8_24",
        "muxRegOffset": "0x004",
        "options": [
            "gpmc_ad1",
            "mmc1_dat1",
            "NA",
            "NA",
            "NA",
            "NA",
            "NA",
            "gpio1_1"
        ],
        "ball": {
            "ZCZ": "V7",
            "BSM": "R2"
        }
    },
    {
        "name": "GPIO1_0",
        "gpio": 32,
        "mux": "gpmc_ad0",
        "eeprom": 20,
        "key": "P8_25",
        "muxRegOffset": "0x000",
        "options": [
            "gpmc_ad0",
            "mmc1_dat0",
            "NA",
            "NA",
            "NA",
            "NA",
            "NA",
            "gpio1_0"
        ],
        "ball": {
            "ZCZ": "U7",
            "BSM": "R3"
        }
    },
    {
        "name": "GPIO1_29",
        "gpio": 61,
        "mux": "gpmc_csn0",
        "eeprom": 37,
        "key": ["P8_26", "BAT75"],
        "led": [null, "bat75"],
        "muxRegOffset": "0x07c",
        "options": [
            "gpmc_csn0",
            "NA",
            "NA",
            "NA",
            "NA",
            "NA",
            "NA",
            "gpio1_29"
        ],
        "ball": {
            "ZCZ": "V6",
            "BSM": "P3"
        }
    },
    {
        "name": "GPIO0_19",
        "gpio": 19,
        "mux": "xdma_event_intr0",
        "eeprom": 37,
        "key": ["WIFI", "P2_31"],
        "led": ["wifi", null],
        "muxRegOffset": "0x1b0",
        "options": [
            "xdma_event_intr0",
            "NA",
            "timer4",
            "clkout1",
            "spi1_cs1",
            "pr1_pru1_pru_r31",
            "EMU2",
            "gpio0_19"
        ],
        "ball": {
            "ZCZ": "A15",
            "BSM": "A4"
        }
    },
    {
        "name": "GPIO2_22",
        "gpio": 86,
        "mux": "lcd_vsync",
        "eeprom": 57,
        "key": ["P8_27", "SERVO_1", "P2_35"],
        "muxRegOffset": "0x0e0",
        "options": [
            "lcd_vsync",
            "gpmc_a8",
            "NA",
            "pr1_edio_data_in2",
            "pr1_edio_data_out2",
            "pr1_pru1_pru_r30_8",
            "pr1_pru1_pru_r31_8",
            "gpio2_22"
        ],
        "ball": {
            "ZCZ": "U5",
            "BSM": "F3"
        }
    },
    {
        "name": "GPIO2_24",
        "gpio": 88,
        "mux": "lcd_pclk",
        "eeprom": 59,
        "key": ["P8_28", "SERVO_2", "P1_35", "PRU1_10"],
        "muxRegOffset": "0x0e8",
        "options": [
            "lcd_pclk",
            "gpmc_a10",
            "pr1_mii0_crs",
            "pr1_edio_data_in4",
            "pr1_edio_data_out4",
            "pr1_pru1_pru_r30_10",
            "pr1_pru1_pru_r31_10",
            "gpio2_24"
        ],
        "ball": {
            "ZCZ": "V5",
            "BSM": "F1"
        }
    },
    {
        "name": "GPIO2_23",
        "gpio": 87,
        "mux": "lcd_hsync",
        "eeprom": 58,
        "key": ["P8_29", "SERVO_3", "P1_2"],
        "muxRegOffset": "0x0e4",
        "options": [
            "lcd_hsync",
            "gpmc_a9",
            "gpmc_a2",
            "pr1_edio_data_in3",
            "pr1_edio_data_out3",
            "pr1_pru1_pru_r30_9",
            "pr1_pru1_pru_r31_9",
            "gpio2_23"
        ],
        "ball": {
            "ZCZ": "R5",
            "BSM": "F2"
        }
    },
    {
        "name": "GPIO2_25",
        "gpio": 89,
        "mux": "lcd_ac_bias_en",
        "eeprom": 60,
        "key": ["P8_30", "SERVO_4", "P1_4", "PRU1_11"],
        "muxRegOffset": "0x0ec",
        "options": [
            "lcd_ac_bias_en",
            "gpmc_a11",
            "pr1_mii1_crs",
            "pr1_edio_data_in5",
            "pr1_edio_data_out5",
            "pr1_pru1_pru_r30_11",
            "pr1_pru1_pru_r31_11",
            "gpio2_25"
        ],
        "ball": {
            "ZCZ": "R6",
            "BSM": "E1"
        }
    },
    {
        "name": "UART5_CTSN",
        "gpio": 10,
        "mux": "lcd_data14",
        "eeprom": 7,
        "key": "P8_31",
        "muxRegOffset": "0x0d8",
        "options": [
            "lcd_data14",
            "gpmc_a18",
            "NA",
            "mcasp0_axr1",
            "NA",
            "NA",
            "NA",
            "gpio0_10"
        ],
        "ball": {
            "ZCZ": "V4",
            "BSM": "L1"
        }
    },
    {
        "name": "UART5_RTSN",
        "gpio": 11,
        "mux": "lcd_data15",
        "eeprom": 8,
        "key": ["P8_32", "BAT50"],
        "led": [null, "bat50"],
        "muxRegOffset": "0x0dc",
        "options": [
            "lcd_data15",
            "gpmc_a19",
            "NA",
            "mcasp0_ahclkx",
            "mcasp0_axr3",
            "NA",
            "NA",
            "gpio0_11"
        ],
        "ball": {
            "ZCZ": "T5",
            "BSM": "M3"
        }
    },
    {
        "name": "UART4_RTSN",
        "gpio": 9,
        "mux": "lcd_data13",
        "eeprom": 6,
        "key": ["P8_33", "E2_4"],
        "muxRegOffset": "0x0d4",
        "options": [
            "lcd_data13",
            "gpmc_a17",
            "NA",
            "mcasp0_fsr",
            "mcasp0_axr3",
            "NA",
            "NA",
            "gpio0_9"
        ],
        "ball": {
            "ZCZ": "V3",
            "BSM": "L2"
        }
    },
    {
        "name": "UART3_RTSN",
        "gpio": 81,
        "mux": "lcd_data11",
        "eeprom": 56,
        // From am335x technical manual, p.183
        // http://www.ti.com/lit/ug/spruh73n/spruh73n.pdf
        "pwm": {
            "module": "ehrpwm1",
            "sysfs": 4,
            "index": 1,
            "muxmode": 2,
            "path": "ehrpwm.1:1",
            "name": "EHRPWM1B",
            "chip": "48302000",
            "addr": "48302200"
        },
        "key": "P8_34",
        "muxRegOffset": "0x0cc",
        "options": [
            "lcd_data11",
            "gpmc_a15",
            "NA",
            "mcasp0_ahclkr",
            "mcasp0_axr2",
            "NA",
            "NA",
            "gpio2_17"
        ],
        "ball": {
            "ZCZ": "V3",
            "BSM": "K1"
        }

    },
    {
        "name": "UART4_CTSN",
        "gpio": 8,
        "mux": "lcd_data12",
        "eeprom": 5,
        "key": ["P8_35", "E2_3"],
        "muxRegOffset": "0x0d0",
        "options": [
            "lcd_data12",
            "gpmc_a16",
            "NA",
            "mcasp0_aclkr",
            "mcasp0_axr2",
            "NA",
            "NA",
            "gpio0_8"
        ],
        "ball": {
            "ZCZ": "V2",
            "BSM": "L3"
        }

    },
    {
        "name": "UART3_CTSN",
        "gpio": 80,
        "mux": "lcd_data10",
        "eeprom": 55,
        // From am335x technical manual, p.183
        // http://www.ti.com/lit/ug/spruh73n/spruh73n.pdf
        "pwm": {
            "module": "ehrpwm1",
            "sysfs": 3,
            "index": 0,
            "muxmode": 2,
            "path": "ehrpwm.1:0",
            "name": "EHRPWM1A",
            "chip": "48302000",
            "addr": "48302200"
        },
        "key": ["P8_36", "SERVO_PWR_EN"],
        "muxRegOffset": "0x0c8",
        "options": [
            "lcd_data10",
            "gpmc_a14",
            "ehrpwm1A",
            "mcasp0_axr0",
            "mcasp0_axr0",
            "pr1_mii0_rxd1",
            "uart3_ctsn",
            "gpio2_16"
        ],
        "ball": {
            "ZCZ": "U3",
            "BSM": "K2"
        }

    },
    {
        "name": "UART5_TXD",
        "gpio": 78,
        "mux": "lcd_data8",
        "eeprom": 53,
        "key": ["P8_37", "UT5_4"],
        "muxRegOffset": "0x0c0",
        "options": [
            "lcd_data8",
            "gpmc_a12",
            "NA",
            "mcasp0_aclkx",
            "NA",
            "NA",
            "uart2_ctsn",
            "gpio2_14"
        ],
        "ball": {
            "ZCZ": "U1",
            "BSM": "J1"
        }

    },
    {
        "name": "UART5_RXD",
        "gpio": 79,
        "mux": "lcd_data9",
        "eeprom": 54,
        "key": ["P8_38", "UT5_3"],
        "muxRegOffset": "0x0c4",
        "options": [
            "lcd_data9",
            "gpmc_a13",
            "NA",
            "mcasp0_fsx",
            "NA",
            "NA",
            "uart2_rtsn",
            "gpio2_15"
        ],
        "ball": {
            "ZCZ": "U2",
            "BSM": "K3"
        }

    },
    {
        "name": "GPIO2_12",
        "gpio": 76,
        "mux": "lcd_data6",
        "eeprom": 51,
        "key": ["P8_39", "SERVO_5"],
        "muxRegOffset": "0x0b8",
        "options": [
            "lcd_data6",
            "gpmc_a6",
            "pr1_edio_data_in6",
            "eqep2_index",
            "pr1_edio_data_out6",
            "pr1_pru1_pru_r30_6",
            "pr1_pru1_pru_r31_6",
            "gpio2_12"
        ],
        "ball": {
            "ZCZ": "T3",
            "BSM": "J3"
        }

    },
    {
        "name": "GPIO2_13",
        "gpio": 77,
        "mux": "lcd_data7",
        "eeprom": 52,
        "key": ["P8_40", "SERVO_6"],
        "muxRegOffset": "0x0bc",
        "options": [
            "lcd_data7",
            "gpmc_a7",
            "pr1_edio_data_in7",
            "eqep2_strobe",
            "pr1_edio_data_out_7",
            "pr1_pru1_pru_r30_7",
            "pr1_pru1_pru_r31_7",
            "gpio2_13"
        ],
        "ball": {
            "ZCZ": "T4",
            "BSM": "J2"
        }

    },
    {
        "name": "GPIO2_10",
        "gpio": 74,
        "mux": "lcd_data4",
        "eeprom": 49,
        "key": ["P8_41", "SERVO_7"],
        "muxRegOffset": "0x0b0",
        "options": [
            "lcd_data4",
            "gpmc_a4",
            "pr1_mii0_txd1",
            "eQEP2A_in",
            "NA",
            "pr1_pru1_pru_r30_4",
            "pr1_pru1_pru_r31_4",
            "gpio2_10"
        ],
        "ball": {
            "ZCZ": "T1",
            "BSM": "H2"
        }

    },
    {
        "name": "GPIO2_11",
        "gpio": 75,
        "mux": "lcd_data5",
        "eeprom": 50,
        "key": ["P8_42", "SERVO_8"],
        "muxRegOffset": "0x0b4",
        "options": [
            "lcd_data5",
            "gpmc_a5",
            "pr1_mii0_txd0",
            "eqep2b_in",
            "NA",
            "pr1_pru1_pru_r30_5",
            "pr1_pru1_pru_r31_5",
            "gpio2_11"
        ],
        "ball": {
            "ZCZ": "T2",
            "BSM": "H1"
        }

    },
    {
        "name": "GPIO2_8",
        "gpio": 72,
        "mux": "lcd_data2",
        "eeprom": 47,
        "key": "P8_43",
        "muxRegOffset": "0x0a8",
        "options": [
            "lcd_data2",
            "gpmc_a2",
            "pr1_mii0_txd3",
            "ehrpwm2_tripzone_input",
            "NA",
            "pr1_pru1_pru_r30_2",
            "pr1_pru1_pru_r31_2",
            "gpio2_8"
        ],
        "ball": {
            "ZCZ": "R3",
            "BSM": "G1"
        }

    },
    {
        "name": "GPIO2_9",
        "gpio": 73,
        "mux": "lcd_data3",
        "eeprom": 48,
        "key": "P8_44",
        "muxRegOffset": "0x0ac",
        "options": [
            "lcd_data3",
            "gpmc_a3",
            "pr1_mii0_txd2",
            "ehrpwm0_synco",
            "NA",
            "pr1_pru1_pru_r30_3",
            "pr1_pru1_pru_r31_3",
            "gpio2_9"
        ],
        "ball": {
            "ZCZ": "R4",
            "BSM": "H3"
        }

    },
    {
        "name": "GPIO2_6",
        "gpio": 70,
        "mux": "lcd_data0",
        "eeprom": 45,
        // From am335x technical manual, p.183
        // http://www.ti.com/lit/ug/spruh73n/spruh73n.pdf
        "pwm": {
            "module": "ehrpwm2",
            "sysfs": 5,
            "index": 0,
            "muxmode": 3,
            "path": "ehrpwm.2:0",
            "name": "EHRPWM2A",
            "chip": "48304000",
            "addr": "48304200"
        },
        "key": "P8_45",
        "muxRegOffset": "0x0a0",
        "options": [
            "lcd_data0",
            "gpmc_a0",
            "pr1_mii_mt0_clk",
            "ehrpwm2A",
            "NA",
            "pr1_pru1_pru_r30_0",
            "pr1_pru1_pru_r31_0",
            "gpio2_6"
        ],
        "ball": {
            "ZCZ": "R1",
            "BSM": "G3"
        }

    },
    {
        "name": "GPIO2_7",
        "gpio": 71,
        "mux": "lcd_data1",
        "eeprom": 46,
        // From am335x technical manual, p.183
        // http://www.ti.com/lit/ug/spruh73n/spruh73n.pdf
        "pwm": {
            "module": "ehrpwm2",
            "sysfs": 6,
            "index": 1,
            "muxmode": 3,
            "path": "ehrpwm.2:1",
            "name": "EHRPWM2B",
            "chip": "48304000",
            "addr": "48304200"
        },
        "key": "P8_46",
        "muxRegOffset": "0x0a4",
        "options": [
            "lcd_data1",
            "gpmc_a1",
            "pr1_mii0_txen",
            "ehrpwm2B",
            "NA",
            "pr1_pru1_pru_r30_1",
            "pr1_pru1_pru_r31_1",
            "gpio2_7"
        ],
        "ball": {
            "ZCZ": "R2",
            "BSM": "G2"
        }

    },
    {
        "name": "VDD_3V3",
        "key": ["P9_3", "P9_4", "P1_14", "P2_23",
            "E1_2", "E2_2", "E3_2", "E4_2", "GP0_2", "GP1_2", "S1_1_2", "S1_2_2",
            "UT0_2", "UT1_2", "UT5_2", "DSM2_1", "I2C_2"
        ]
    },
    {
        "name": "VDD_5V",
        "key": ["P9_5", "P9_6", "P1_1"]
    },
    {
        "name": "SYS_5V",
        "key": ["P9_7", "P9_8", "P1_24", "P2_13", "GPS_5"]
    },
    {
        "name": "PWR_BUT",
        "key": ["P9_9", "P2_12"],
        "ball": {
            "BSM": "T11"
        }
    },
    {
        "name": "SYS_RESETn",
        "key": ["P9_10", "P2_26"],
        "ball": {
            "ZCZ": "A10",
            "BSM": "R11"
        }
    },
    {
        "name": "UART4_RXD",
        "gpio": 30,
        "mux": "gpmc_wait0",
        "eeprom": 18,
        "key": ["P9_11", "DSM2_3", "P2_5"],
        "muxRegOffset": "0x070",
        "options": [
            "gpmc_wait0",
            "mii2_crs",
            "gpmc_csn4",
            "rmii2_crs_dv",
            "mmc1_sdcd",
            "pr1_mii1_col",
            "uart4_rxd",
            "gpio0_30"
        ],
        "ball": {
            "ZCZ": "T17",
            "BSM": "P15"
        }
    },
    {
        "name": "GPIO1_28",
        "gpio": 60,
        "mux": "gpmc_ben1",
        "eeprom": 36,
        "key": ["P9_12", "P2_8"],
        "muxRegOffset": "0x078",
        "options": [
            "gpmc_ben1",
            "mii2_col",
            "NA",
            "mmc2_dat3",
            "NA",
            "NA",
            "mcasp0_aclkr",
            "gpio1_28"
        ],
        "ball": {
            "ZCZ": "U18",
            "BSM": "N14"
        }

    },
    {
        "name": "UART4_TXD",
        "gpio": 31,
        "mux": "gpmc_wpn",
        "eeprom": 19,
        "key": ["P9_13", "P2_7"],
        "muxRegOffset": "0x074",
        "options": [
            "gpmc_wpn",
            "mii2_rxerr",
            "NA",
            "rmii2_rxerr",
            "mmc2_sdcd",
            "NA",
            "NA",
            "gpio0_31"
        ],
        "ball": {
            "ZCZ": "U17",
            "BSM": "R16"
        }

    },
    {
        "name": "EHRPWM1A",
        "gpio": 50,
        "mux": "gpmc_a2",
        "eeprom": 34,
        // From am335x technical manual, p.183
        // http://www.ti.com/lit/ug/spruh73n/spruh73n.pdf
        "pwm": {
            "module": "ehrpwm1",
            "sysfs": 3,
            "index": 0,
            "muxmode": 6,
            "path": "ehrpwm.1:0",
            "name": "EHRPWM1A",
            "chip": "48302000",
            "addr": "48302200"
        },
        "key": ["P9_14", "P2_1"],
        "universalName": ["ocp:P9_14_pinmux", "ocp:P2_01_pinmux", "ocp:PWM_pinmux"],
        "muxRegOffset": "0x048",
        "options": [
            "gpmc_a2",
            "gmii2_txd3",
            "rgmii2_td3",
            "mmc2_dat1",
            "gpmc_a18",
            "pr1_mii1_txd2",
            "ehrpwm1A",
            "gpio1_18"
        ],
        "ball": {
            "ZCZ": "U14",
            "BSM": "P12"
        }

    },
    {
        "name": "GPIO1_16",
        "gpio": 48,
        "mux": "mii1_rxd3",
        "eeprom": 32,
        "key": "P9_15",
        "muxRegOffset": "0x040",
        "options": [
            "gpmc_a0",
            "gmii2_txen",
            "rgmii2_tctl",
            "rmii2_txen",
            "gpmc_a16",
            "pr1_mii_mt1_clk",
            "ehrpwm1_tripzone_input",
            "gpio1_16"
        ],
        "ball": {
            "ZCZ": "R13",
            "BSM": "T12"
        }

    },
    {
        "name": "GPIO1_16",
        "gpio": 64,
        "mux": "gpmc_csn3",
        "eeprom": null,
        "key": ["P9_15B", "P2_20"],
        "muxRegOffset": "0x088",
        "options": [
            "gpmc_csn3",
            "gpmc_a3",
            "rmii2_crs_dv",
            "mmc2_cmd",
            "pr1_mii0_crs",
            "pr1_mdio_data",
            "gpio2_0"
        ],
        "ball": {
            "ZCZ": "T13",
            "BSM": "R7"
        }
    },
    {
        "name": "EHRPWM1B",
        "gpio": 51,
        "mux": "gpmc_a3",
        "eeprom": 35,
        // From am335x technical manual, p.183
        // http://www.ti.com/lit/ug/spruh73n/spruh73n.pdf
        "pwm": {
            "module": "ehrpwm1",
            "sysfs": 4,
            "index": 1,
            "muxmode": 6,
            "path": "ehrpwm.1:1",
            "name": "EHRPWM1B",
            "chip": "48302000",
            "addr": "48302200"
        },
        "key": "P9_16",
        "muxRegOffset": "0x04c",
        "options": [
            "gpmc_a3",
            "gmii2_txd2",
            "rgmii2_td2",
            "mmc2_dat2",
            "gpmc_a19",
            "pr1_mii1_txd1",
            "ehrpwm1B",
            "gpio1_19"
        ],
        "ball": {
            "ZCZ": "T14",
            "BSM": "T13"
        }
    },
    {
        "name": "I2C1_SCL",
        "gpio": 5,
        "mux": "spi0_cs0",
        "eeprom": 3,
        "key": ["P9_17", "I2C_3", "P1_6"],
        "muxRegOffset": "0x15c",
        "options": [
            "spi0_cs0",
            "mmc2_sdwp",
            "i2c1_scl",
            "ehrpwm0_synci",
            "pr1_uart0_txd",
            "pr1_edio_data_in1",
            "pr1_edio_data_out1",
            "gpio0_5"
        ],
        "ball": {
            "ZCZ": "A16",
            "BSM": "A14"
        }
    },
    {
        "name": "I2C1_SDA",
        "gpio": 4,
        "mux": "spi0_d1",
        "eeprom": 2,
        "key": ["P9_18", "I2C_4", "P1_12"],
        "muxRegOffset": "0x158",
        "options": [
            "spi0_d1",
            "mmc1_sdwp",
            "i2c1_sda",
            "ehrpwm0_tripzone_input",
            "pr1_uart0_rxd",
            "pr1_edio_data_in0",
            "pr1_edio_data_out0",
            "gpio0_4"
        ],
        "ball": {
            "ZCZ": "B16",
            "BSM": "B14"
        }
    },
    {
        "name": "I2C2_SCL",
        "gpio": 13,
        "mux": "uart1_rtsn",
        "eeprom": 9,
        "key": ["P9_19", "P1_28"],
        "muxRegOffset": "0x17c",
        "options": [
            "uart1_rtsn",
            "timer5",
            "d_can0_rx",
            "i2c2_scl",
            "spi1_cs1",
            "pr1_uart0_rts_n",
            "pr1_edc_latch1_in",
            "gpio0_13"
        ],
        "ball": {
            "ZCZ": "D17",
            "BSM": "A10"
        }
    },
    {
        "name": "I2C2_SDA",
        "gpio": 12,
        "mux": "uart1_ctsn",
        "eeprom": 10,
        "key": ["P9_20", "P1_26"],
        "muxRegOffset": "0x178",
        "options": [
            "uart1_ctsn",
            "NA",
            "d_can0_tx",
            "i2c2_sda",
            "spi1_cs0",
            "pr1_uart0_cts_n",
            "pr1_edc_latch0_in",
            "gpio0_12"
        ],
        "ball": {
            "ZCZ": "D18",
            "BSM": "B10"
        }
    },
    {
        "name": "UART2_TXD",
        "gpio": 3,
        "mux": "spi0_d0",
        "eeprom": 1,
        // From am335x technical manual, p.183
        // http://www.ti.com/lit/ug/spruh73n/spruh73n.pdf
        "pwm": {
            "module": "ehrpwm0",
            "sysfs": 1,
            "index": 1,
            "muxmode": 3,
            "path": "ehrpwm.0:1",
            "name": "EHRPWM0B",
            "chip": "48300000",
            "addr": "48300200"
        },
        "key": ["P9_21", "GPS_4", "P1_10"],
        "muxRegOffset": "0x154",
        "options": [
            "spi0_d0",
            "uart2_txd",
            "i2c2_scl",
            "ehrpwm0B",
            "pr1_uart_rts_n",
            "pr1_edio_latch_in",
            "EMU3",
            "gpio0_3"
        ],
        "ball": {
            "ZCZ": "B17",
            "BSM": "B13"
        }
    },
    {
        "name": "UART2_RXD",
        "gpio": 2,
        "mux": "spi0_sclk",
        "eeprom": 0,
        // From am335x technical manual, p.183
        // http://www.ti.com/lit/ug/spruh73n/spruh73n.pdf
        "pwm": {
            "module": "ehrpwm0",
            "sysfs": 0,
            "index": 0,
            "muxmode": 3,
            "path": "ehrpwm.0:0",
            "name": "EHRPWM0A",
            "chip": "48300000",
            "addr": "48300200"
        },
        "key": ["P9_22", "GPS_3", "P1_8"],
        "muxRegOffset": "0x150",
        "options": [
            "spi0_sclk",
            "uart2_rxd",
            "i2c2_sda",
            "ehrpwm0A",
            "pr1_uart_cts_n",
            "pr1_edio_sof",
            "EMU2",
            "gpio0_2"
        ],
        "ball": {
            "ZCZ": "A17",
            "BSM": "A13"
        }
    },
    {
        "name": "GPIO1_17",
        "gpio": 49,
        "mux": "gpmc_a1",
        "eeprom": 33,
        "key": ["P9_23", "GP0_4"],
        "muxRegOffset": "0x044",
        "options": [
            "gpmc_a1",
            "gmii2_rxdv",
            "rgmii2_rctl",
            "mmc2_dat0",
            "gpmc_a17",
            "pr1_mii1_txd3",
            "ehrpwm0_synco",
            "gpio1_17"
        ],
        "ball": {
            "ZCZ": "V14",
            "BSM": "R12"
        }
    },
    {
        "name": "GPIO1_25",
        "gpio": 57,
        "mux": "gpmc_wpn",
        "eeprom": null,
        "key": ["GP0_3", "P2_6"],
        "muxRegOffset": "0x064",
        "options": [
            "gpmc_wpn",
            "gmii2_rxer",
            "gpmc_csn5",
            "rmii2_rxer",
            "mmc2_sdcd",
            "pr1_mii1_txen",
            "uart4_txd",
            "gpio1_25"
        ],
        "ball": {
            "ZCZ": "U16",
            "BSM": "T15"
        }
    },
    {
        "name": "GPIO3_2",
        "gpio": 98,
        "mux": "gmii1_rxer",
        "eeprom": null,
        "key": "GP1_3",
        "muxRegOffset": "0x110",
        "options": [
            "gmii1_rxer",
            "NA",
            "NA",
            "NA",
            "NA",
            "NA",
            "NA",
            "gpio3_2"
        ],
        "ball": {
            "ZCZ": "J15",
            "BSM": "E15"
        }
    },
    {
        "name": "GPIO3_1",
        "gpio": 97,
        "mux": "gmii1_crs",
        "eeprom": null,
        "key": "GP1_4",
        "muxRegOffset": "0x10c",
        "options": [
            "gmii1_crs",
            "NA",
            "NA",
            "NA",
            "NA",
            "NA",
            "NA",
            "gpio3_1"
        ],
        "ball": {
            "ZCZ": "H17",
            "BSM": "F14"
        }

    },
    {
        "name": "UART1_TXD",
        "gpio": 15,
        "mux": "uart1_txd",
        "eeprom": 12,
        "key": ["P9_24", "UT1_4", "P2_9"],
        "muxRegOffset": "0x184",
        "options": [
            "uart1_txd",
            "mmc2_sdwp",
            "d_can1_rx",
            "i2c1_scl",
            "NA",
            "pr1_uart0_txd_mux1",
            "NA",
            "gpio0_15"
        ],
        "ball": {
            "ZCZ": "D15",
            "BSM": "B11"
        }
    },
    {
        "name": "GPIO3_21",
        "gpio": 117,
        "mux": "mcasp0_ahclkx",
        "eeprom": 66,
        "key": ["P9_25", "P1_29", "PRU0_7"],
        "muxRegOffset": "0x1ac",
        "options": [
            "mcasp0_ahclkx",
            "NA",
            "mcasp0_axr3",
            "mcasp1_axr1",
            "NA",
            "NA",
            "NA",
            "gpio3_21"
        ],
        "ball": {
            "ZCZ": "A14",
            "BSM": "C4"
        }
    },
    {
        "name": "UART1_RXD",
        "gpio": 14,
        "mux": "uart1_rxd",
        "eeprom": 11,
        "key": ["P9_26", "UT1_3", "P2_11"],
        "muxRegOffset": "0x180",
        "options": [
            "uart1_rxd",
            "mmc1_sdwp",
            "d_can1_tx",
            "i2c1_sda",
            "NA",
            "pr1_uart0_rxd_mux1",
            "pr1_pru1_pru_r31_16",
            "gpio0_14"
        ],
        "ball": {
            "ZCZ": "D16",
            "BSM": "A11"
        }
    },
    {
        "name": "GPIO3_19",
        "gpio": 115,
        "mux": "mcasp0_fsr",
        "eeprom": 64,
        "key": ["P9_27", "P2_34", "PRU0_5", "E1_4"],
        "muxRegOffset": "0x1a4",
        "options": [
            "mcasp0_fsr",
            "NA",
            "mcasp0_axr3",
            "mcasp1_fsx",
            "EMU2",
            "pr1_pru0_pru_r30_5",
            "pr1_pru0_pru_r31_5",
            "gpio3_19"
        ],
        "ball": {
            "ZCZ": "C13",
            "BSM": "B3"
        }
    },
    {
        "name": "SPI1_CS0",
        "gpio": 113,
        "mux": "mcasp0_ahclkr",
        "eeprom": 63,
        // From am335x technical manual, p.183
        // http://www.ti.com/lit/ug/spruh73n/spruh73n.pdf
        "pwm": {
            "module": "ecap2",
            "sysfs": 7,
            "index": 0,
            "muxmode": 4,
            "path": "ecap.2",
            "name": "ECAPPWM2",
            "universalMode": "pwm2",
            "chip": "48304000",
            "addr": "48304100"
        },
        "key": ["P9_28", "GP0_6", "P2_30", "PRU0_3"],
        "muxRegOffset": "0x19c",
        "options": [
            "mcasp0_ahclkr",
            "NA",
            "mcasp0_axr2",
            "spi1_cs0",
            "eCAP2_in_PWM2_out",
            "pr1_pru0_pru_r30_3",
            "pr1_pru0_pru_r31_3",
            "gpio3_17"
        ],
        "ball": {
            "ZCZ": "C12",
            "BSM": "B1"
        }
    },
    {
        "name": "SPI1_D0",
        "gpio": 111,
        "mux": "mcasp0_fsx",
        "eeprom": 61,
        // From am335x technical manual, p.183
        // http://www.ti.com/lit/ug/spruh73n/spruh73n.pdf
        "pwm": {
            "module": "ehrpwm0",
            "sysfs": 1,
            "index": 1,
            "muxmode": 1,
            "path": "ehrpwm.0:1",
            "name": "EHRPWM0B",
            "chip": "48300000",
            "addr": "48300200"
        },
        "key": ["P9_29", "S1_1_4", "S1_2_4", "P1_33", "PRU0_1"],
        "muxRegOffset": "0x194",
        "options": [
            "mcasp0_fsx",
            "ehrpwm0B",
            "NA",
            "spi1_d0",
            "mmc1_sdcd",
            "pr1_pru0_pru_r30_1",
            "pr1_pru0_pru_r31_1",
            "gpio3_15"
        ],
        "ball": {
            "ZCZ": "B13",
            "BSM": "A2"
        }
    },
    {
        "name": "SPI1_D1",
        "gpio": 112,
        "mux": "mcasp0_axr0",
        "eeprom": 62,
        "key": ["P9_30", "S1_1_3", "S1_2_3", "P2_32", "PRU0_2"],
        "muxRegOffset": "0x198",
        "options": [
            "mcasp0_axr0",
            "NA",
            "NA",
            "spi1_d1",
            "mmc2_sdcd",
            "pr1_pru0_pru_r30_2",
            "pr1_pru0_pru_r31_2",
            "gpio3_16"
        ],
        "ball": {
            "ZCZ": "D12",
            "BSM": "B2"
        }
    },
    {
        "name": "SPI1_SCLK",
        "gpio": 110,
        "mux": "mcasp0_aclkx",
        "eeprom": 65,
        // From am335x technical manual, p.183
        // http://www.ti.com/lit/ug/spruh73n/spruh73n.pdf
        "pwm": {
            "module": "ehrpwm0",
            "sysfs": 0,
            "index": 0,
            "muxmode": 1,
            "path": "ehrpwm.0:0",
            "name": "EHRPWM0A",
            "chip": "48300000",
            "addr": "48300200"
        },
        "key": ["P9_31", "S1_1_5", "S1_2_5", "P1_36"],
        "muxRegOffset": "0x190",
        "options": [
            "mcasp0_aclkx",
            "ehrpwm0A",
            "NA",
            "spi1_sclk",
            "mmc0_sdcd",
            "pr1_pru0_pru_r30_0",
            "pr1_pru0_pru_r31_0",
            "gpio3_14"
        ],
        "ball": {
            "ZCZ": "A13",
            "BSM": "A1"
        }
    },
    {
        "name": "VDD_ADC",
        "key": ["P9_32", "ADC_2", "P1_17"],
        "ball": {
            "ZCZ": "A9",
            "BSM": "B9"
        }
    },
    {
        "name": "AIN4",
        "ain": 4,
        "eeprom": 71,
        "scale": 4096,
        "key": ["P9_33", "P1_27"],
        "ball": {
            "ZCZ": "C8",
            "BSM": "C7"
        }
    },
    {
        "name": "GNDA_ADC",
        "key": ["P9_34", "ADC_1", "P1_18"],
        "ball": {
            "ZCZ": "B9",
            "BSM": "B7"
        }
    },
    {
        "name": "AIN6",
        "ain": 6,
        "eeprom": 73,
        "scale": 4096,
        "key": ["P9_35", "P1_2"],
        "ball": {
            "ZCZ": "A8",
            "BSM": "C9"
        }
    },
    {
        "name": "AIN5",
        "ain": 5,
        "eeprom": 72,
        "scale": 4096,
        "key": ["P9_36", "P2_35"],
        "ball": {
            "ZCZ": "B8",
            "BSM": "C8"
        }
    },
    {
        "name": "AIN2",
        "ain": 2,
        "eeprom": 69,
        "scale": 4096,
        "key": ["P9_37", "ADC_5", "P1_23"],
        "ball": {
            "ZCZ": "B7",
            "BSM": "B6"
        }
    },
    {
        "name": "AIN3",
        "ain": 3,
        "eeprom": 70,
        "scale": 4096,
        "key": ["P9_38", "ADC_6", "P1_25"],
        "ball": {
            "ZCZ": "A7",
            "BSM": "C6"
        }
    },
    {
        "name": "AIN0",
        "ain": 0,
        "eeprom": 67,
        "scale": 4096,
        "key": ["P9_39", "ADC_3", "P1_19"],
        "ball": {
            "ZCZ": "B6",
            "BSM": "A8"
        }
    },
    {
        "name": "AIN1",
        "ain": 1,
        "eeprom": 68,
        "scale": 4096,
        "key": ["P9_40", "ADC_4", "P1_21"],
        "ball": {
            "ZCZ": "C7",
            "BSM": "B8"
        }
    },
    {
        "name": "AIN7",
        "ain": 7,
        "eeprom": null,
        "scale": 4096,
        "key": "P2_36",
        "ball": {
            "ZCZ": "C9",
            "BSM": "D7"
        }
    },
    {
        "name": "CLKOUT2",
        "gpio": 116,
        "mux": "mcasp0_axr1",
        "eeprom": null,
        "key": ["P9_41", "GP0_5", "P2_28", "PRU0_6"],
        "muxRegOffset": "0x1a8",
        "options": [
            "mcasp0_axr1",
            "eQEP0_index",
            "mcasp1_axr0",
            "EMU3",
            "NA",
            "NA",
            "NA",
            "gpio3_20"
        ],
        "ball": {
            "ZCZ": "D13",
            "BSM": "C3"
        }
    },
    {
        "name": "CLKOUT2",
        "gpio": 20,
        "mux": "xdma_event_intr1",
        "eeprom": 13,
        "key": ["P9_41B", "P1_20"],
        "muxRegOffset": "0x1b4",
        "options": [
            "xdma_event_intr1",
            "NA",
            "NA",
            "clkout2",
            "NA",
            "NA",
            "NA",
            "gpio0_20"
        ],
        "ball": {
            "ZCZ": "D14",
            "BSM": "B4"
        }
    },
    {
        "name": "GPIO0_7",
        "gpio": 7,
        "mux": "ecap0_in_pwm0_out",
        "eeprom": 4,
        // From am335x technical manual, p.183
        // http://www.ti.com/lit/ug/spruh73n/spruh73n.pdf
        "pwm": {
            "module": "ecap0",
            "sysfs": 2,
            "index": 0,
            "muxmode": 0,
            "path": "ecap.0",
            "name": "ECAPPWM0",
            "chip": "48300000",
            "addr": "48300100"
        },
        "key": ["P9_42", "S1_2_6", "P2_29"],
        "muxRegOffset": "0x164",
        "options": [
            "eCAP0_in_PWM0_out",
            "uart3_txd",
            "spi1_cs1",
            "pr1_ecap0_ecap_capin_apwm_o",
            "spi1_sclk",
            "mmc0_sdwp",
            "xdma_event_intr2",
            "gpio0_7"
        ],
        "ball": {
            "ZCZ": "C18",
            "BSM": "C5"
        }
    },
    {
        "name": "GPIO0_7",
        "gpio": 114,
        "mux": "ecap0_in_pwm0_out",
        "eeprom": null,
        "key": ["P9_42B", "E1_3", "P1_31", "PRU0_4"],
        "muxRegOffset": "0x1a0",
        "options": [
            "mcasp0_aclkr",
            "eQEP0A_in",
            "mcasp0_axr2",
            "mcasp1_aclkx",
            "mmc0_sdwp",
            "pr1_pru0_pru_r30_4",
            "pr1_pru0_pru_r31_4",
            "gpio3_18"
        ],
        "ball": {
            "ZCZ": "B12",
            "BSM": "A3"
        }
    },
    {
        "name": "USB1_DRVVBUS",
        "gpio": 109,
        "key": "P1_3",
        "muxRegOffset": "0x134",
        "mux": "USB1_DRVVBUS",
        "eeprom": null,
        "options": [
            "USB1_DRVVBUS",
            "NA",
            "NA",
            "NA",
            "NA",
            "NA",
            "NA",
            "gpio3_13"
        ],
        "ball": {
            "ZCZ": "F15",
            "BSM": "M14"
        }
    },
    {
        "name": "USB1_VBUS",
        "key": "P1_5",
        "ball": {
            "ZCZ": "T18",
            "BSM": "M15"
        },
        "muxRegOffset": "0x130"
    },
    {
        "name": "VIN_USB",
        "key": "P1_7",
        "ball": {
            "BSM": ["P9", "R9", "T9"]
        },
    },
    {
        "name": "USB1_DN",
        "key": "P1_9",
        "ball": {
            "ZCZ": "R18",
            "BSM": "L16"
        },
        "muxRegOffset": "0x120"
    },
    {
        "name": "USB1_DP",
        "key": "P1_11",
        "ball": {
            "ZCZ": "R17",
            "BSM": "L15"
        },
        "muxRegOffset": "0x124"
    },
    {
        "name": "USB1_ID",
        "key": "P1_13",
        "ball": {
            "ZCZ": "P17",
            "BSM": "L14"
        },
        "muxRegOffset": "0x12c"
    },
    {
        "name": "VIN_BAT",
        "key": "P2_14",
        "ball": {
            "BSM": ["P8", "R8", "T8"]
        },
    },
    {
        "name": "BAT_TEMP",
        "key": "P2_16",
        "ball": {
            "BSM": "N6"
        },
    },
    {
        "name": "UART0_RXD",
        "gpio": 42,
        "mux": "uart0_rxd",
        "eeprom": null,
        "key": ["UT0_3", "P1_32"],
        "muxRegOffset": "0x170",
        "options": [
            "uart0_rxd",
            "spi1_cs0",
            "dcan0_tx",
            "i2c2_sda",
            "eCAP2_in_PWM2_out",
            "pr1_pru1_pru_r30_14",
            "pr1_pru1_pru_r31_14",
            "gpio1_10"
        ],
        "ball": {
            "ZCZ": "E15",
            "BSM": "A12"
        }
    },
    {
        "name": "UART0_TXD",
        "gpio": 43,
        "mux": "uart0_txd",
        "eeprom": null,
        "key": ["UT0_4", "P1_30"],
        "muxRegOffset": "0x174",
        "options": [
            "uart0_rxd",
            "spi1_cs1",
            "dcan0_4x",
            "i2c2_scl",
            "eCAP1_in_PWM1_out",
            "pr1_pru1_pru_r30_15",
            "pr1_pru1_pru_r31_15",
            "gpio1_11"
        ],
        "ball": {
            "ZCZ": "E16",
            "BSM": "B12"
        }
    },
    {
        "name": "GPIO1_20",
        "gpio": 52,
        "mux": "gpmc_a4",
        "eeprom": null,
        "key": "P2_10",
        "muxRegOffset": "0x050",
        "options": [
            "gpmc_a4",
            "gmii2_txd1",
            "rgmii2_td1",
            "rmii2_txd1",
            "gpmc_a20",
            "pr1_mii1_txd0",
            "eQEP1A_in",
            "gpio1_20"
        ],
        "ball": {
            "ZCZ": "R14",
            "BSM": "R13"
        }
    },
    {
        "name": "GPIO1_27",
        "gpio": 59,
        "mux": "gpmc_a11",
        "eeprom": null,
        "key": "P2_2",
        "muxRegOffset": "0x06c",
        "options": [
            "gpmc_a11",
            "gmii2_rxd0",
            "rgmii2_rd0",
            "rmii2_rxd0",
            "gpmc_a27",
            "pr1_mii1_rxer",
            "mcasp0_axr1",
            "gpio1_27"
        ],
        "ball": {
            "ZCZ": "V17",
            "BSM": "T16"
        }
    },
    {
        "name": "GPIO1_26",
        "gpio": 58,
        "mux": "gpmc_a10",
        "eeprom": null,
        "key": "P2_4",
        "muxRegOffset": "0x068",
        "options": [
            "gpmc_a10",
            "gmii2_rxd1",
            "rgmii2_rd1",
            "rmii2_rxd1",
            "gpmc_a26",
            "pr1_mii1_rxdv",
            "mcasp0_axr0",
            "gpio1_26"
        ],
        "ball": {
            "ZCZ": "T16",
            "BSM": "R15"
        }
    },
    {
        "name": "GPIO1_9",
        "gpio": 41,
        "mux": "uart0_rtsn",
        "eeprom": null,
        "key": "P2_25",
        "muxRegOffset": "0x16c",
        "options": [
            "uart0_rtsn",
            "uart4_txd",
            "dcan1_rx",
            "i2c1_scl",
            "spi1_d1",
            "spi1_cs0",
            "pr1_edc_sync1_out",
            "gpio1_9"
        ],
        "ball": {
            "ZCZ": "E17",
            "BSM": "C13"
        }
    },
    {
        "name": "GPIO1_8",
        "gpio": 40,
        "mux": "uart0_ctsn",
        "eeprom": null,
        "key": "P2_27",
        "muxRegOffset": "0x168",
        "options": [
            "uart0_ctsn",
            "uart4_txd",
            "dcan1_tx",
            "i2c1_sda",
            "spi1_d0",
            "timer7",
            "pr1_edc_sync0_out",
            "gpio1_8"
        ],
        "ball": {
            "ZCZ": "E18",
            "BSM": "C12"
        }
    },
    {
        "name": "MMC0_SDCD",
        "gpio": 6,
        "mux": "spi0_cs1",
        "eeprom": null,
        "muxRegOffset": "0x160",
        "options": [
            "spi0_cs1",
            "uart3_rxd",
            "eCAP1_in_PWM1_out",
            "mmc0_pow",
            "xdma_event_intr2",
            "mmc0_sdcd",
            "EMU4",
            "gpio0_6"
        ],
        "ball": {
            "ZCZ": "C15",
            "BSM": "C14"
        }
    },
    {
        "name": "MDIO_DATA",
        "gpio": 0,
        "mux": "mdio_data",
        "eeprom": null,
        "muxRegOffset": "0x148",
        "options": [
            "mdio_data",
            "timer6",
            "uart5_rxd",
            "uart3_ctsn",
            "mmc0_sdcd",
            "mmc1_cmd",
            "mmc2_cmd",
            "gpio0_0"
        ],
        "ball": {
            "ZCZ": "M17",
            "BSM": "E13"
        }
    },
    {
        "name": "MDIO_CLK",
        "gpio": 1,
        "mux": "mdio_clk",
        "eeprom": null,
        "muxRegOffset": "0x14c",
        "options": [
            "mdio_clk",
            "timer5",
            "uart5_txd",
            "uart3_rtsn",
            "mmc0_wp",
            "mmc1_clk",
            "mmc2_clk",
            "gpio0_1"
        ],
        "ball": {
            "ZCZ": "M18",
            "BSM": "D13"
        }
    },
    {
        "name": "MII_TX3",
        "gpio": 16,
        "mux": "gmii1_txd3",
        "eeprom": null,
        "muxRegOffset": "0x11c",
        "options": [
            "gmii1_txd3",
            "NA",
            "NA",
            "NA",
            "NA",
            "NA",
            "NA",
            "gpio0_16"
        ],
        "ball": {
            "ZCZ": "J18",
            "BSM": "G15"
        }
    },
    {
        "name": "MII_TX2",
        "gpio": 17,
        "mux": "gmii1_txd2",
        "eeprom": null,
        "muxRegOffset": "0x120",
        "options": [
            "gmii1_txd2",
            "NA",
            "NA",
            "NA",
            "NA",
            "NA",
            "NA",
            "gpio0_17"
        ],
        "ball": {
            "ZCZ": "K15",
            "BSM": "G16"
        }
    },
    {
        "name": "USB0_DRVVBUS",
        "gpio": 18,
        "mux": "USB0_DRVVBUS",
        "eeprom": null,
        "muxRegOffset": "0x11c",
        "options": [
            "USB0_DRVVBUS",
            "NA",
            "NA",
            "NA",
            "NA",
            "NA",
            "NA",
            "gpio0_18"
        ],
        "ball": {
            "ZCZ": "F16",
            "BSM": "J15"
        }
    },
    {
        "name": "MII_TX1",
        "gpio": 21,
        "mux": "gmii1_txd1",
        "eeprom": null,
        "muxRegOffset": "0x124",
        "options": [
            "gmii1_txd1",
            "NA",
            "NA",
            "NA",
            "NA",
            "NA",
            "NA",
            "gpio0_21"
        ],
        "ball": {
            "ZCZ": "K16",
            "BSM": "H14"
        }
    },
    {
        "name": "MII_TX1",
        "gpio": 21,
        "mux": "gmii1_txd1",
        "eeprom": null,
        "muxRegOffset": "0x124",
        "options": [
            "gmii1_txd1",
            "NA",
            "NA",
            "NA",
            "NA",
            "NA",
            "NA",
            "gpio0_21"
        ],
        "ball": {
            "ZCZ": "K16",
            "BSM": "H14"
        }
    },
    {
        "name": "MII_TX0",
        "gpio": 28,
        "mux": "gmii1_txd0",
        "eeprom": null,
        "muxRegOffset": "0x128",
        "options": [
            "gmii1_txd0",
            "NA",
            "NA",
            "NA",
            "NA",
            "NA",
            "NA",
            "gpio0_28"
        ],
        "ball": {
            "ZCZ": "K17",
            "BSM": "H15"
        }
    },
    {
        "name": "MII_TX0",
        "gpio": 28,
        "mux": "gmii1_txd0",
        "eeprom": null,
        "muxRegOffset": "0x128",
        "options": [
            "gmii1_txd0",
            "NA",
            "NA",
            "NA",
            "NA",
            "NA",
            "NA",
            "gpio0_28"
        ],
        "ball": {
            "ZCZ": "K17",
            "BSM": "H15"
        }
    },
    {
        "name": "GPIO0_29",
        "gpio": 29,
        "mux": "rmii1_refclk",
        "eeprom": null,
        "key": "S1_1_6",
        "muxRegOffset": "0x144",
        "options": [
            "rmii1_refclk",
            "NA",
            "spi1_cs0",
            "NA",
            "NA",
            "NA",
            "NA",
            "gpio0_28"
        ],
        "ball": {
            "ZCZ": "H18",
            "BSM": "J14"
        }
    },
    {
        "name": "MII_RX3",
        "gpio": 82,
        "mux": "gmii1_rxd3",
        "eeprom": null,
        "muxRegOffset": "0x134",
        "options": [
            "gmii1_rxd3",
            "NA",
            "NA",
            "NA",
            "NA",
            "NA",
            "NA",
            "gpio2_18"
        ],
        "ball": {
            "ZCZ": "L17",
            "BSM": "D14"
        }
    },
    {
        "name": "MII_RX2",
        "gpio": 83,
        "mux": "gmii1_rxd2",
        "eeprom": null,
        "muxRegOffset": "0x138",
        "options": [
            "gmii1_rxd2",
            "NA",
            "NA",
            "NA",
            "NA",
            "NA",
            "NA",
            "gpio2_19"
        ],
        "ball": {
            "ZCZ": "L16",
            "BSM": "D15"
        }
    },
    {
        "name": "MII_RX1",
        "gpio": 84,
        "mux": "gmii1_rxd1",
        "eeprom": null,
        "muxRegOffset": "0x13c",
        "options": [
            "gmii1_rxd1",
            "NA",
            "NA",
            "NA",
            "NA",
            "NA",
            "NA",
            "gpio2_20"
        ],
        "ball": {
            "ZCZ": "L15",
            "BSM": "D16"
        }
    },
    {
        "name": "MII_RX0",
        "gpio": 85,
        "mux": "gmii1_rxd0",
        "eeprom": null,
        "muxRegOffset": "0x140",
        "options": [
            "gmii1_rxd0",
            "NA",
            "NA",
            "NA",
            "NA",
            "NA",
            "NA",
            "gpio2_21"
        ],
        "ball": {
            "ZCZ": "M16",
            "BSM": "E14"
        }
    },
    {
        "name": "MMC0_DAT3",
        "gpio": 90,
        "mux": "mmc0_dat3",
        "eeprom": null,
        "muxRegOffset": "0x0f0",
        "options": [
            "mmc0_dat3",
            "NA",
            "NA",
            "NA",
            "NA",
            "NA",
            "NA",
            "gpio2_26"
        ],
        "ball": {
            "ZCZ": "F17",
            "BSM": "C15"
        }
    },
    {
        "name": "MMC0_DAT2",
        "gpio": 91,
        "mux": "mmc0_dat2",
        "eeprom": null,
        "muxRegOffset": "0x0f4",
        "options": [
            "mmc0_dat2",
            "NA",
            "NA",
            "NA",
            "NA",
            "NA",
            "NA",
            "gpio2_27"
        ],
        "ball": {
            "ZCZ": "F18",
            "BSM": "C16"
        }
    },
    {
        "name": "MMC0_DAT1",
        "gpio": 92,
        "mux": "mmc0_dat1",
        "eeprom": null,
        "muxRegOffset": "0x0f8",
        "options": [
            "mmc0_dat1",
            "NA",
            "NA",
            "NA",
            "NA",
            "NA",
            "NA",
            "gpio2_28"
        ],
        "ball": {
            "ZCZ": "G15",
            "BSM": "A15"
        }
    },
    {
        "name": "MMC0_DAT0",
        "gpio": 93,
        "mux": "mmc0_dat0",
        "eeprom": null,
        "muxRegOffset": "0x0fc",
        "options": [
            "mmc0_dat0",
            "NA",
            "NA",
            "NA",
            "NA",
            "NA",
            "NA",
            "gpio2_29"
        ],
        "ball": {
            "ZCZ": "G16",
            "BSM": "A16"
        }
    },
    {
        "name": "MMC0_CLK",
        "gpio": 94,
        "mux": "mmc0_clk",
        "eeprom": null,
        "muxRegOffset": "0x100",
        "options": [
            "mmc0_clk",
            "NA",
            "NA",
            "NA",
            "NA",
            "NA",
            "NA",
            "gpio2_30"
        ],
        "ball": {
            "ZCZ": "G17",
            "BSM": "B15"
        }
    },
    {
        "name": "MMC0_CMD",
        "gpio": 95,
        "mux": "mmc0_cmd",
        "eeprom": null,
        "muxRegOffset": "0x104",
        "options": [
            "mmc0_cmd",
            "NA",
            "NA",
            "NA",
            "NA",
            "NA",
            "NA",
            "gpio2_31"
        ],
        "ball": {
            "ZCZ": "G18",
            "BSM": "B16"
        }
    },
    {
        "name": "MII_COL",
        "gpio": 96,
        "mux": "gmii1_col",
        "eeprom": null,
        "muxRegOffset": "0x108",
        "options": [
            "gmii1_col",
            "NA",
            "NA",
            "NA",
            "NA",
            "NA",
            "NA",
            "gpio3_0"
        ],
        "ball": {
            "ZCZ": "H16",
            "BSM": "F15"
        }
    },
    {
        "name": "MII_TXEN",
        "gpio": 99,
        "mux": "gmii1_txen",
        "eeprom": null,
        "muxRegOffset": "0x114",
        "options": [
            "gmii1_txen",
            "NA",
            "NA",
            "NA",
            "NA",
            "NA",
            "NA",
            "gpio3_3"
        ],
        "ball": {
            "ZCZ": "J16",
            "BSM": "G14"
        }
    },
    {
        "name": "MII_RXDV",
        "gpio": 100,
        "mux": "gmii1_rxdv",
        "eeprom": null,
        "muxRegOffset": "0x118",
        "options": [
            "gmii1_rxdv",
            "NA",
            "NA",
            "NA",
            "NA",
            "NA",
            "NA",
            "gpio3_4"
        ],
        "ball": {
            "ZCZ": "J17",
            "BSM": "F16"
        }
    },
    {
        "name": "I2C0_SDA",
        "gpio": 101,
        "mux": "I2C0_SDA",
        "eeprom": null,
        "muxRegOffset": "0x188",
        "options": [
            "I2C0_SDA",
            "NA",
            "NA",
            "NA",
            "NA",
            "NA",
            "NA",
            "gpio3_5"
        ],
        "ball": {
            "ZCZ": "C17",
            "BSM": "C11"
        }
    },
    {
        "name": "I2C0_SCL",
        "gpio": 102,
        "mux": "I2C0_SCL",
        "eeprom": null,
        "muxRegOffset": "0x18c",
        "options": [
            "I2C0_SCL",
            "NA",
            "NA",
            "NA",
            "NA",
            "NA",
            "NA",
            "gpio3_6"
        ],
        "ball": {
            "ZCZ": "C16",
            "BSM": "C10"
        }
    },
    {
        "name": "EMU0",
        "gpio": 103,
        "mux": "EMU0",
        "eeprom": null,
        "muxRegOffset": "0x1e4",
        "options": [
            "EMU0",
            "NA",
            "NA",
            "NA",
            "NA",
            "NA",
            "NA",
            "gpio3_7"
        ],
        "ball": {
            "ZCZ": "C14",
            "BSM": "E2"
        }
    },
    {
        "name": "EMU1",
        "gpio": 104,
        "mux": "EMU1",
        "eeprom": null,
        "muxRegOffset": "0x1e8",
        "options": [
            "EMU1",
            "NA",
            "NA",
            "NA",
            "NA",
            "NA",
            "NA",
            "gpio3_8"
        ],
        "ball": {
            "ZCZ": "B14",
            "BSM": "E3"
        }
    },
    {
        "name": "MII_TXCLK",
        "gpio": 105,
        "mux": "gmii1_txclk",
        "eeprom": null,
        "muxRegOffset": "0x12c",
        "options": [
            "gmii1_txclk",
            "NA",
            "NA",
            "NA",
            "NA",
            "NA",
            "NA",
            "gpio3_9"
        ],
        "ball": {
            "ZCZ": "K18",
            "BSM": "H16"
        }
    },
    {
        "name": "MII_RXCLK",
        "gpio": 106,
        "mux": "gmii1_rxclk",
        "eeprom": null,
        "muxRegOffset": "0x130",
        "options": [
            "gmii1_rxclk",
            "NA",
            "NA",
            "NA",
            "NA",
            "NA",
            "NA",
            "gpio3_10"
        ],
        "ball": {
            "ZCZ": "L18",
            "BSM": "E16"
        }
    },
    {
        "name": "MII_RXCLK",
        "gpio": 106,
        "mux": "gmii1_rxclk",
        "eeprom": null,
        "muxRegOffset": "0x130",
        "options": [
            "gmii1_rxclk",
            "NA",
            "NA",
            "NA",
            "NA",
            "NA",
            "NA",
            "gpio3_10"
        ],
        "ball": {
            "ZCZ": "L18",
            "BSM": "E16"
        }
    },
];

var pins = {};
for (var i in pinIndex) {
    if (Array.isArray(pinIndex[i].key)) {
        for (var j = 0; j < pinIndex[i].key.length; j++) {
            var myKey = pinIndex[i].key[j];
            //console.log("key[" + j + "].[" + myKey + "]: " + i);
            pins[myKey] = i;
        }
    } else if (typeof pinIndex[i] != 'undefined') {
        pins[pinIndex[i].key] = i;
    }
    if (typeof pinIndex[i].gpio == 'number') {
        pins["GPIO_" + pinIndex[i].gpio] = i;
    }
    if (typeof pinIndex[i].eeprom == 'number') {
        pins["EEPROM_" + pinIndex[i].eeprom] = i;
    }
    if (typeof pinIndex[i].ain == 'number') {
        pins["A" + pinIndex[i].ain] = i;
    }
    if (typeof pinIndex[i].muxRegOffset == 'string') {
        var offset = pinIndex[i].muxRegOffset.toUpperCase();
        pins["MUX_" + offset] = i;
    }
}

var uarts = {
    "/dev/ttyO0": {},
    "/dev/ttyO1": {
        "devicetree": "BB-UART1",
        "rx": "P9_26",
        "tx": "P9_24"
    },
    "/dev/ttyO2": {
        "devicetree": "BB-UART2",
        "rx": "P9_22",
        "tx": "P9_21"
    },
    "/dev/ttyO3": {},
    "/dev/ttyO4": {
        "devicetree": "BB-UART4",
        "rx": "P9_11",
        "tx": "P9_13"
    },
    "/dev/ttyO5": {
        "devicetree": "BB-UART5",
        "rx": "P8_38",
        "tx": "P8_37"
    }
};

var i2c = {
    "/dev/i2c-0": {},
    "/dev/i2c-1": {
        "devicetree": "BB-I2C1",
        "path": "/dev/i2c-2",
        "sda": "P9_18",
        "scl": "P9_17"
    },
    "/dev/i2c-1a": {
        "devicetree": "BB-I2C1A",
        "path": "/dev/i2c-2",
        "sda": "P9_26",
        "scl": "P9_24"
    },
    "/dev/i2c-2": {
        "path": "/dev/i2c-1",
        "sda": "P9_20",
        "scl": "P9_19"
    }
};

var getPinObject = function (key) {
    if (typeof key == "string") {
        // Ignore case
        key = key.toUpperCase();
        // Replace alternate separators and leading zeros
        key = key.replace(/[\.\-_ ]0*/g, "_");
    }
    if (typeof key == "number") {
        key = "GPIO_" + key;
    }
    //console.log(key);
    //console.log(pins[key]);
    if (typeof pinIndex[pins[key]] == "object") {
        var pinObject = Object.assign({}, pinIndex[pins[key]]);

        // Only keep the matching index led
        if (pinObject.led) {
            //console.log("pinObject[" + key + "]: " + JSON.stringify(pinObject));
            if (Array.isArray(pinObject.led)) {
                //console.log("pinObject.key: " + pinObject.key);
                var i = pinObject.key.indexOf(key);
                if (i >= 0) {
                    var led = pinObject.led[i];
                    pinObject.led = led;
                    //console.log("pinObject.led[" + i + "]: " + led);
                } else {
                    pinObject.led = null;
                }
            }
        }

        // Remove other keys
        pinObject.key = key;
    } else {
        return (null);
    }

    return (pinObject);
};

var getPinKeys = function (filter) {
    var keys = [];
    for (var key in pins) {
        if (typeof filter != 'undefined') {
            if (key.search(filter) >= 0) {
                keys.push(key);
            }
        } else {
            keys.push(key);
        }
    }
    return (keys);
};

// from https://stackoverflow.com/questions/15478954/sort-array-elements-string-with-numbers-natural-sort
var naturalCompare = function (a, b) {
    var ax = [],
        bx = [];

    a.replace(/(\d+)|(\D+)/g, function (_, $1, $2) {
        ax.push([$1 || Infinity, $2 || ""])
    });
    b.replace(/(\d+)|(\D+)/g, function (_, $1, $2) {
        bx.push([$1 || Infinity, $2 || ""])
    });

    while (ax.length && bx.length) {
        var an = ax.shift();
        var bn = bx.shift();
        var nn = (an[0] - bn[0]) || an[1].localeCompare(bn[1]);
        if (nn) return nn;
    }

    return ax.length - bx.length;
}



module.exports = {
    getPinObject: getPinObject,
    getPinKeys: getPinKeys,
    naturalCompare: naturalCompare,
    uarts: uarts,
    i2c: i2c
}