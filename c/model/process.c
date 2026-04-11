/*
 * process.c
 * ProcessTable initialisation and management.
 */

#include "process.h"
#include <string.h>

void process_table_init(ProcessTable *pt) {
    memset(pt, 0, sizeof(ProcessTable));
    pt->next_pid = 1;
}
