if(typeof exports === 'undefined') exports = {};

var pinIndex = [
    {
        "name": "USR0",
        "gpio": 53,
        "led": "usr0",
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
        ]
    },
    {
        "name": "USR1",
        "gpio": 54,
        "led": "usr1",
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
        ]
    },
    {
        "name": "USR2",
        "gpio": 55,
        "led": "usr2",
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
        ]
    },
    {
        "name": "USR3",
        "gpio": 56,
        "led": "usr3",
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
        ]
    },
    {
        "name": "DGND",
        "key": "P8_1"
    },
    {
        "name": "DGND",
        "key": "P8_2"
    },
    {
        "name": "GPIO1_6",
        "gpio": 38,
        "mux": "gpmc_ad6",
        "eeprom": 26,
        "key": "P8_3",
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
        ]
    },
    {
        "name": "GPIO1_7",
        "gpio": 39,
        "mux": "gpmc_ad7",
        "eeprom": 27,
        "key": "P8_4",
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
        ]
    },
    {
        "name": "GPIO1_2",
        "gpio": 34,
        "mux": "gpmc_ad2",
        "eeprom": 22,
        "key": "P8_5",
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
        ]
    },
    {
        "name": "GPIO1_3",
        "gpio": 35,
        "mux": "gpmc_ad3",
        "eeprom": 23,
        "key": "P8_6",
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
        ]
    },
    {
        "name": "TIMER4",
        "gpio": 66,
        "mux": "gpmc_advn_ale",
        "eeprom": 41,
        "key": "P8_7",
        "muxRegOffset": "0x090",
        "options": [
            "gpmc_advn_ale",
            "NA",
            "NA",
            "NA",
            "NA",
            "NA",
            "NA",
            "mmc1_sdcd"
        ]
    },
    {
        "name": "TIMER7",
        "gpio": 67,
        "mux": "gpmc_oen_ren",
        "eeprom": 44,
        "key": "P8_8",
        "muxRegOffset": "0x094",
        "options": [
            "gpmc_oen_ren",
            "NA",
            "NA",
            "NA",
            "NA",
            "NA",
            "NA",
            "gpio2_3"
        ]
    },
    {
        "name": "TIMER5",
        "gpio": 69,
        "mux": "gpmc_ben0_cle",
        "eeprom": 42,
        "key": "P8_9",
        "muxRegOffset": "0x09c",
        "options": [
            "gpmc_ben0_cle",
            "NA",
            "NA",
            "NA",
            "NA",
            "NA",
            "NA",
            "gpio2_5"
        ]
    },
    {
        "name": "TIMER6",
        "gpio": 68,
        "mux": "gpmc_wen",
        "eeprom": 43,
        "key": "P8_10",
        "muxRegOffset": "0x098",
        "options": [
            "gpmc_wen",
            "NA",
            "NA",
            "NA",
            "NA",
            "NA",
            "NA",
            "gpio2_4"
        ]
    },
    {
        "name": "GPIO1_13",
        "gpio": 45,
        "mux": "gpmc_ad13",
        "eeprom": 29,
        "key": "P8_11",
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
        ]
    },
    {
        "name": "GPIO1_12",
        "gpio": 44,
        "mux": "gpmc_ad12",
        "eeprom": 28,
        "key": "P8_12",
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
        ]
    },
    {
        "name": "EHRPWM2B",
        "gpio": 23,
        "mux": "gpmc_ad9",
        "eeprom": 15,
        "pwm": {
            "module": "ehrpwm2",
            "index": 1,
            "muxmode": 4,
            "path": "ehrpwm.2:1",
            "name": "EHRPWM2B"
        },
        "key": "P8_13",
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
        ]
    },
    {
        "name": "GPIO0_26",
        "gpio": 26,
        "mux": "gpmc_ad10",
        "eeprom": 16,
        "key": "P8_14",
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
        ]
    },
    {
        "name": "GPIO1_15",
        "gpio": 47,
        "mux": "gpmc_ad15",
        "eeprom": 31,
        "key": "P8_15",
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
        ]
    },
    {
        "name": "GPIO1_14",
        "gpio": 46,
        "mux": "gpmc_ad14",
        "eeprom": 30,
        "key": "P8_16",
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
        ]
    },
    {
        "name": "GPIO0_27",
        "gpio": 27,
        "mux": "gpmc_ad11",
        "eeprom": 17,
        "key": "P8_17",
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
        ]
    },
    {
        "name": "GPIO2_1",
        "gpio": 65,
        "mux": "gpmc_clk",
        "eeprom": 40,
        "key": "P8_18",
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
        ]
    },
    {
        "name": "EHRPWM2A",
        "gpio": 22,
        "mux": "gpmc_ad8",
        "eeprom": 14,
        "pwm": {
            "module": "ehrpwm2",
            "index": 0,
            "muxmode": 4,
            "path": "ehrpwm.2:0",
            "name": "EHRPWM2A"
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
        ]
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
        ]
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
        ]
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
        ]
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
        ]
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
        ]
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
        ]
    },
    {
        "name": "GPIO1_29",
        "gpio": 61,
        "mux": "gpmc_csn0",
        "eeprom": 37,
        "key": "P8_26",
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
        ]
    },
    {
        "name": "GPIO2_22",
        "gpio": 86,
        "mux": "lcd_vsync",
        "eeprom": 57,
        "key": "P8_27",
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
        ]
    },
    {
        "name": "GPIO2_24",
        "gpio": 88,
        "mux": "lcd_pclk",
        "eeprom": 59,
        "key": "P8_28",
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
        ]
    },
    {
        "name": "GPIO2_23",
        "gpio": 87,
        "mux": "lcd_hsync",
        "eeprom": 58,
        "key": "P8_29",
        "muxRegOffset": "0x0e4",
        "options": [
            "lcd_hsync",
            "gpmc_a9",
            "NA",
            "pr1_edio_data_in3",
            "pr1_edio_data_out3",
            "pr1_pru1_pru_r30_9",
            "pr1_pru1_pru_r31_9",
            "gpio2_23"
        ]
    },
    {
        "name": "GPIO2_25",
        "gpio": 89,
        "mux": "lcd_ac_bias_en",
        "eeprom": 60,
        "key": "P8_30",
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
        ]
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
        ]
    },
    {
        "name": "UART5_RTSN",
        "gpio": 11,
        "mux": "lcd_data15",
        "eeprom": 8,
        "key": "P8_32",
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
        ]
    },
    {
        "name": "UART4_RTSN",
        "gpio": 9,
        "mux": "lcd_data13",
        "eeprom": 6,
        "key": "P8_33",
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
        ]
    },
    {
        "name": "UART3_RTSN",
        "gpio": 81,
        "mux": "lcd_data11",
        "eeprom": 56,
        "pwm": {
            "module": "ehrpwm1",
            "index": 1,
            "muxmode": 2,
            "path": "ehrpwm.1:1",
            "name": "EHRPWM1B"
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
        ]
    },
    {
        "name": "UART4_CTSN",
        "gpio": 8,
        "mux": "lcd_data12",
        "eeprom": 5,
        "key": "P8_35",
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
        ]
    },
    {
        "name": "UART3_CTSN",
        "gpio": 80,
        "mux": "lcd_data10",
        "eeprom": 55,
        "pwm": {
            "module": "ehrpwm1",
            "index": 0,
            "muxmode": 2,
            "path": "ehrpwm.1:0",
            "name": "EHRPWM1A"
        },
        "key": "P8_36",
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
        ]
    },
    {
        "name": "UART5_TXD",
        "gpio": 78,
        "mux": "lcd_data8",
        "eeprom": 53,
        "key": "P8_37",
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
        ]
    },
    {
        "name": "UART5_RXD",
        "gpio": 79,
        "mux": "lcd_data9",
        "eeprom": 54,
        "key": "P8_38",
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
        ]
    },
    {
        "name": "GPIO2_12",
        "gpio": 76,
        "mux": "lcd_data6",
        "eeprom": 51,
        "key": "P8_39",
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
        ]
    },
    {
        "name": "GPIO2_13",
        "gpio": 77,
        "mux": "lcd_data7",
        "eeprom": 52,
        "key": "P8_40",
        "muxRegOffset": "0x0bc",
        "options": [
            "lcd_data7",
            "gpmc_a7",
            "pr1_edio_data_in7",
            "eqep2_strobe",
            "pr1_pru1_pru_r30_7",
            "pr1_pru_pru1_r30_7",
            "pr1_pru1_pru_r31_7",
            "gpio2_13"
        ]
    },
    {
        "name": "GPIO2_10",
        "gpio": 74,
        "mux": "lcd_data4",
        "eeprom": 49,
        "key": "P8_41",
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
        ]
    },
    {
        "name": "GPIO2_11",
        "gpio": 75,
        "mux": "lcd_data5",
        "eeprom": 50,
        "key": "P8_42",
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
        ]
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
        ]
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
        ]
    },
    {
        "name": "GPIO2_6",
        "gpio": 70,
        "mux": "lcd_data0",
        "eeprom": 45,
        "pwm": {
            "module": "ehrpwm2",
            "index": 0,
            "muxmode": 3,
            "path": "ehrpwm.2:0",
            "name": "EHRPWM2A"
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
        ]
    },
    {
        "name": "GPIO2_7",
        "gpio": 71,
        "mux": "lcd_data1",
        "eeprom": 46,
        "pwm": {
            "module": "ehrpwm2",
            "index": 1,
            "muxmode": 3,
            "path": "ehrpwm.2:1",
            "name": "EHRPWM2B"
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
        ]
    },
    {
        "name": "DGND",
        "key": "P9_1"
    },
    {
        "name": "DGND",
        "key": "P9_2"
    },
    {
        "name": "VDD_3V3",
        "key": "P9_3"
    },
    {
        "name": "VDD_3V3",
        "key": "P9_4"
    },
    {
        "name": "VDD_5V",
        "key": "P9_5"
    },
    {
        "name": "VDD_5V",
        "key": "P9_6"
    },
    {
        "name": "SYS_5V",
        "key": "P9_7"
    },
    {
        "name": "SYS_5V",
        "key": "P9_8"
    },
    {
        "name": "PWR_BUT",
        "key": "P9_9"
    },
    {
        "name": "SYS_RESETn",
        "key": "P9_10"
    },
    {
        "name": "UART4_RXD",
        "gpio": 30,
        "mux": "gpmc_wait0",
        "eeprom": 18,
        "key": "P9_11",
        "muxRegOffset": "0x070",
        "options": [
            "gpmc_wait0",
            "mii2_crs",
            "NA",
            "rmii2_crs_dv",
            "mmc1_sdcd",
            "NA",
            "NA",
            "gpio0_30"
        ]
    },
    {
        "name": "GPIO1_28",
        "gpio": 60,
        "mux": "gpmc_ben1",
        "eeprom": 36,
        "key": "P9_12",
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
        ]
    },
    {
        "name": "UART4_TXD",
        "gpio": 31,
        "mux": "gpmc_wpn",
        "eeprom": 19,
        "key": "P9_13",
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
        ]
    },
    {
        "name": "EHRPWM1A",
        "gpio": 50,
        "mux": "gpmc_a2",
        "eeprom": 34,
        "pwm": {
            "module": "ehrpwm1",
            "index": 0,
            "muxmode": 6,
            "path": "ehrpwm.1:0",
            "name": "EHRPWM1A"
        },
        "key": "P9_14",
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
        ]
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
        ]
    },
    {
        "name": "EHRPWM1B",
        "gpio": 51,
        "mux": "gpmc_a3",
        "eeprom": 35,
        "pwm": {
            "module": "ehrpwm1",
            "index": 1,
            "muxmode": 6,
            "path": "ehrpwm.1:1",
            "name": "EHRPWM1B"
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
        ]
    },
    {
        "name": "I2C1_SCL",
        "gpio": 5,
        "mux": "spi0_cs0",
        "eeprom": 3,
        "key": "P9_17",
        "muxRegOffset": "0x15c",
        "options": [
            "spi0_cs0",
            "mmc2_sdwp",
            "i2c1_scl",
            "NA",
            "NA",
            "NA",
            "NA",
            "gpio0_5"
        ]
    },
    {
        "name": "I2C1_SDA",
        "gpio": 4,
        "mux": "spi0_d1",
        "eeprom": 2,
        "key": "P9_18",
        "muxRegOffset": "0x158",
        "options": [
            "spi0_d1",
            "mmc1_sdwp",
            "i2c1_sda",
            "NA",
            "NA",
            "NA",
            "NA",
            "gpio0_4"
        ]
    },
    {
        "name": "I2C2_SCL",
        "gpio": 13,
        "mux": "uart1_rtsn",
        "eeprom": 9,
        "key": "P9_19",
        "muxRegOffset": "0x17c",
        "options": [
            "uart1_rtsn",
            "NA",
            "d_can0_rx",
            "i2c2_scl",
            "spi1_cs1",
            "NA",
            "NA",
            "gpio0_13"
        ]
    },
    {
        "name": "I2C2_SDA",
        "gpio": 12,
        "mux": "uart1_ctsn",
        "eeprom": 10,
        "key": "P9_20",
        "muxRegOffset": "0x178",
        "options": [
            "uart1_ctsn",
            "NA",
            "d_can0_tx",
            "i2c2_sda",
            "spi1_cs0",
            "NA",
            "NA",
            "gpio0_12"
        ]
    },
    {
        "name": "UART2_TXD",
        "gpio": 3,
        "mux": "spi0_d0",
        "eeprom": 1,
        "pwm": {
            "module": "ehrpwm0",
            "index": 1,
            "muxmode": 3,
            "path": "ehrpwm.0:1",
            "name": "EHRPWM0B"
        },
        "key": "P9_21",
        "muxRegOffset": "0x154",
        "options": [
            "spi0_d0",
            "uart2_txd",
            "i2c2_scl",
            "NA",
            "NA",
            "NA",
            "NA",
            "gpio0_3"
        ]
    },
    {
        "name": "UART2_RXD",
        "gpio": 2,
        "mux": "spi0_sclk",
        "eeprom": 0,
        "pwm": {
            "module": "ehrpwm0",
            "index": 0,
            "muxmode": 3,
            "path": "ehrpwm.0:0",
            "name": "EHRPWM0A"
        },
        "key": "P9_22",
        "muxRegOffset": "0x150",
        "options": [
            "spi0_sclk",
            "uart2_rxd",
            "i2c2_sda",
            "NA",
            "NA",
            "NA",
            "NA",
            "gpio0_2"
        ]
    },
    {
        "name": "GPIO1_17",
        "gpio": 49,
        "mux": "gpmc_a1",
        "eeprom": 33,
        "key": "P9_23",
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
        ]
    },
    {
        "name": "UART1_TXD",
        "gpio": 15,
        "mux": "uart1_txd",
        "eeprom": 12,
        "key": "P9_24",
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
        ]
    },
    {
        "name": "GPIO3_21",
        "gpio": 117,
        "mux": "mcasp0_ahclkx",
        "eeprom": 66,
        "key": "P9_25",
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
        ]
    },
    {
        "name": "UART1_RXD",
        "gpio": 14,
        "mux": "uart1_rxd",
        "eeprom": 11,
        "key": "P9_26",
        "muxRegOffset": "0x180",
        "options": [
            "uart1_rxd",
            "mmc1_sdwp",
            "d_can1_tx",
            "i2c1_sda",
            "NA",
            "pr1_uart0_rxd_mux1",
            "NA",
            "gpio0_14"
        ]
    },
    {
        "name": "GPIO3_19",
        "gpio": 115,
        "mux": "mcasp0_fsr",
        "eeprom": 64,
        "key": "P9_27",
        "muxRegOffset": "0x1a4",
        "options": [
            "mcasp0_fsr",
            "NA",
            "mcasp0_axr3",
            "mcasp1_fsx",
            "NA",
            "pr1_pru0_pru_r30_5",
            "NA",
            "gpio3_19"
        ]
    },
    {
        "name": "SPI1_CS0",
        "gpio": 113,
        "mux": "mcasp0_ahclkr",
        "eeprom": 63,
        "pwm": {
            "module": "ecap2",
            "index": 2,
            "muxmode": 4,
            "path": "ecap.2",
            "name": "ECAPPWM2"
        },
        "key": "P9_28",
        "muxRegOffset": "0x19c",
        "options": [
            "mcasp0_ahclkr",
            "NA",
            "mcasp0_axr2",
            "spi1_cs0",
            "eCAP2_in_PWM2_out",
            "NA",
            "NA",
            "gpio3_17"
        ]
    },
    {
        "name": "SPI1_D0",
        "gpio": 111,
        "mux": "mcasp0_fsx",
        "eeprom": 61,
        "pwm": {
            "module": "ehrpwm0",
            "index": 1,
            "muxmode": 1,
            "path": "ehrpwm.0:1",
            "name": "EHRPWM0B"
        },
        "key": "P9_29",
        "muxRegOffset": "0x194",
        "options": [
            "mcasp0_fsx",
            "ehrpwm0B",
            "NA",
            "spi1_d0",
            "mmc1_sdcd",
            "NA",
            "NA",
            "gpio3_15"
        ]
    },
    {
        "name": "SPI1_D1",
        "gpio": 112,
        "mux": "mcasp0_axr0",
        "eeprom": 62,
        "key": "P9_30",
        "muxRegOffset": "0x198",
        "options": [
            "mcasp0_axr0",
            "NA",
            "NA",
            "spi1_d1",
            "mmc2_sdcd",
            "NA",
            "NA",
            "gpio3_16"
        ]
    },
    {
        "name": "SPI1_SCLK",
        "gpio": 110,
        "mux": "mcasp0_aclkx",
        "eeprom": 65,
        "pwm": {
            "module": "ehrpwm0",
            "index": 0,
            "muxmode": 1,
            "path": "ehrpwm.0:0",
            "name": "EHRPWM0A"
        },
        "key": "P9_31",
        "muxRegOffset": "0x190",
        "options": [
            "mcasp0_aclkx",
            "ehrpwm0A",
            "NA",
            "spi1_sclk",
            "mmc0_sdcd",
            "NA",
            "NA",
            "gpio3_14"
        ]
    },
    {
        "name": "VDD_ADC",
        "key": "P9_32"
    },
    {
        "name": "AIN4",
        "ain": 4,
        "eeprom": 71,
        "scale": 4096,
        "key": "P9_33"
    },
    {
        "name": "GNDA_ADC",
        "key": "P9_34"
    },
    {
        "name": "AIN6",
        "ain": 6,
        "eeprom": 73,
        "scale": 4096,
        "key": "P9_35"
    },
    {
        "name": "AIN5",
        "ain": 5,
        "eeprom": 72,
        "scale": 4096,
        "key": "P9_36"
    },
    {
        "name": "AIN2",
        "ain": 2,
        "eeprom": 69,
        "scale": 4096,
        "key": "P9_37"
    },
    {
        "name": "AIN3",
        "ain": 3,
        "eeprom": 70,
        "scale": 4096,
        "key": "P9_38"
    },
    {
        "name": "AIN0",
        "ain": 0,
        "eeprom": 67,
        "scale": 4096,
        "key": "P9_39"
    },
    {
        "name": "AIN1",
        "ain": 1,
        "eeprom": 68,
        "scale": 4096,
        "key": "P9_40"
    },
    {
        "name": "CLKOUT2",
        "gpio": 20,
        "mux": "xdma_event_intr1",
        "eeprom": 13,
        "key": "P9_41",
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
        ]
    },
    {
        "name": "GPIO0_7",
        "gpio": 7,
        "mux": "ecap0_in_pwm0_out",
        "eeprom": 4,
        "pwm": {
            "module": "ecap0",
            "index": 0,
            "muxmode": 0,
            "path": "ecap.0",
            "name": "ECAPPWM0"
        },
        "key": "P9_42",
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
        ]
    },
    {
        "name": "DGND",
        "key": "P9_43"
    },
    {
        "name": "DGND",
        "key": "P9_44"
    },
    {
        "name": "DGND",
        "key": "P9_45"
    },
    {
        "name": "DGND",
        "key": "P9_46"
    }
];

var pins = {};
for(var i in pinIndex) {
    pins[pinIndex[i].key] = pinIndex[i];
}

var uarts = {
    "/dev/ttyO0": {
    },
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
    "/dev/ttyO3": {
    },
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
    "/dev/i2c-0": {
    },
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

exports.pins = pins;
exports.pinIndex = pinIndex;
exports.uarts = uarts;
exports.i2c = i2c;
